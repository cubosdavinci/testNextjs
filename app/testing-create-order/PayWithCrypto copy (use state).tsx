'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { createOrderAction } from './actions';
import { EscrowV1_ABI } from './ABI/registerEscrow' 


export default function PayWithCrypto() {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  async function pay() {
    setLoading(true);

    // 1. Call server action
    const { order, signature, method } = await createOrderAction('prod_123', 'lic_456');

    // 2. MetaMask
    if (!(window as any).ethereum) {
      alert('MetaMask not found');
      return;
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    console.log()
    // 3. Escrow contract
    const escrow = new ethers.Contract(
      process.env.AMOY_ESCROW_CONTRACT_ADDRESS!,
      EscrowV1_ABI,
      signer
    );

    // 4. Send transaction
    const tx = await escrow.registerEscrow(order, signature);

    await tx.wait();
    setTxHash(tx.hash);
    setLoading(false);
  }

  return (
    <div>
      <button onClick={pay} disabled={loading}>
        {loading ? 'Processing...' : 'Pay with Crypto (MetaMask)'}
      </button>

      {txHash && (
        <p>
          Tx sent: <code>{txHash}</code>
        </p>
      )}
    </div>
  );
}
