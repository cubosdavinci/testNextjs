// components/WalletWrapper.tsx
'use client';

import { Wallet } from '@/app/my-solana-provider';

interface Props {
  children: React.ReactNode;
}

export default function WalletWrapper({ children }: Props) {
  return <Wallet>{children}</Wallet>;
}