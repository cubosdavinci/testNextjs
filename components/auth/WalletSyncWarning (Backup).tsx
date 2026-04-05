'use client'

import React from 'react'
import { useSession } from '@/components/auth/useSession'

export const WalletSyncWarning = () => {
  const { user, isWalletAdapterSynchronized } = useSession()

  // Only show warning if user is signed in
  if (!user) return null

  // Show warning if wallet adapter is not synchronized
  if (!isWalletAdapterSynchronized) {
    return (
     <div
  style={{
    padding: '1rem',
    backgroundColor: '#ffcccc',
    color: '#a00',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    width: '100%', // full width
  }}
  className="flex justify-center items-center text-center"
>
  ⚠️ Warning: Your connected wallet does not match your signed-in user.
</div>
    )
  }

  // Wallet is synchronized, nothing to render
  return null
}