'use client'

import { useAppKitAccount } from '@reown/appkit/react'
import { appKit } from '@/app/providers'

export default function WalletButton() {
  const { isConnected } = useAppKitAccount()

  return (
    <button
      onClick={() => appKit.open()}
      title={isConnected ? 'Wallet connected – click to open' : 'Wallet not connected – click to connect'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 4,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <img
        src={
          isConnected
            ? '/images/web3/wallets/wallet-connected.png'
            : '/images/web3/wallets/wallet-disconnected.png'
        }
        alt={isConnected ? 'Wallet connected' : 'Wallet not connected'}
        width={32}
        height={32}
        style={{ objectFit: 'contain' }}
      />
    </button>
  )
}
