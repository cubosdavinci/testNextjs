/*"use client";

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi'; // your config above

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}*/



/*
import SignClient from "@walletconnect/sign-client";

let wcClient: SignClient;

async function initWalletConnect() {
  wcClient = await SignClient.init({
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
    metadata: {
      name: "Sign in with your wallet",
      description: "WalletConnect v2 Demo",
      url: "https://3000-cs-996772579179-default.cs-europe-west1-xedi.cloudshell.dev/",
      icons: ["https://3000-cs-996772579179-default.cs-europe-west1-xedi.cloudshell.dev/favicon.ico"],
    },
  });

  console.log("WalletConnect Client ready:", wcClient);
}*/