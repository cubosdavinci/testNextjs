"use client";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { WagmiProvider } from "wagmi";
import { http } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!;

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(),
  },
});


export const appKit = createAppKit({
  
  projectId,
  adapters: [wagmiAdapter],  
  networks: [arbitrumSepolia],
  enableWalletConnect: true,
  features: {
    email: false,
    socials: false,
  },
  metadata: {
    name: "MyCoolApp",
    description: "A DeFi dashboard for your crypto",
    url: "https://3000-cs-996772579179-default.cs-europe-west1-xedi.cloudshell.dev",
    icons: [
      "https://3000-cs-996772579179-default.cs-europe-west1-xedi.cloudshell.dev/favicon.ico",
    ],
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
