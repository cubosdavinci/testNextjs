import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
import {Wallet} from '@/app/my-solana-provider'
import { WalletSyncWarning } from '@/components/auth/WalletSyncWarning'

/*
export const metadata: Metadata = {
  title: 'AppKit Example App',
  description: 'Powered by Reown'
}*/

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <html lang="en">
      <body className={inter.className}>
        <Wallet>
           <div>
      <WalletSyncWarning />
      {/* rest of your dashboard */}
    </div>
          {children}
        </Wallet>

      </body>
    </html>
  )
}