'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const Wallet = dynamic(
  () => import('./solana-provider').then((m) => m.Wallet),
  { ssr: false }
)

export function Providers({ children }: { children: React.ReactNode }) {
  return <Wallet>{children}</Wallet>
}