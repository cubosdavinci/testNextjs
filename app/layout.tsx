import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
import {Wallet} from '@/app/my-solana-provider'
import { WalletSyncWarning } from '@/components/auth/WalletSyncWarning'
import Script from 'next/script'


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
                {/* Load Google Identity Services SDK after hydration */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
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