'use client'

import { useState, useTransition } from 'react'
import { ethers } from 'ethers'
import { createOrderAction } from './actions'
import { EscrowV1_ABI } from './ABI/registerEscrow'

export default function PayWithCrypto() {
  const [isPending, startTransition] = useTransition()
  const [txHash, setTxHash] = useState<string | null>(null)

  async function pay() {
    if (!(window as any).ethereum) {
      alert('MetaMask not found')
      return
    }

    // 1. Call server action
    const { order, signature } = await createOrderAction(
      'prod_123',
      'lic_456'
    )

    // 2. MetaMask
    const provider = new ethers.BrowserProvider(
      (window as any).ethereum
    )
    const signer = await provider.getSigner()

    // 3. Escrow contract
    const escrow = new ethers.Contract(
      process.env.NEXT_PUBLIC_AMOY_ESCROW_CONTRACT_ADDRESS!,
      EscrowV1_ABI,
      signer
    )

    // 4. Send transaction
    const tx = await escrow.registerEscrow(order, signature)
    await tx.wait()

    setTxHash(tx.hash)
  }

  return (
    <div>
      <button
        onClick={() => startTransition(() => pay())}
        disabled={isPending}
      >
        {isPending ? 'Processing...' : 'Pay with Crypto (MetaMask)'}
      </button>

      {txHash && (
        <p>
          Tx sent: <code>{txHash}</code>
        </p>
      )}
    </div>
  )
}
