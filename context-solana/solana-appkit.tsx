'use client'

import  { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";

// 0. Set up Solana Adapter
const solanaWeb3JsAdapter = new SolanaAdapter();

// 1. Get projectId from https://dashboard.reown.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;

// 2. Create a metadata object - optional
const metadata = {
  name: 'appkit-example',
  description: 'AppKit Example',
  url: 'https://3000-cs-996772579179-default.cs-europe-west1-xedi.cloudshell.dev', // origin must match your domain & subdomain
  icons: ['https://3000-cs-996772579179-default.cs-europe-west1-xedi.cloudshell.dev/favicon.ico']
}

// 3. Create modal for Solana
createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solanaDevnet],
  metadata: metadata,
  projectId,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

export default function AppKitProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
