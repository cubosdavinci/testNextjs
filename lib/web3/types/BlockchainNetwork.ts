// lib/web3/types/bcNetwork.ts

import type { ERC20Token } from "./ERC20Token";

export type BlockchainNetwork = {
  chainId: number;
  key: string;            // "arbitrum", "base", "optimism", "amoy"
  name: string;          // "Arbitrum One"
  shortName: string;    // "Arbitrum"
  rpcUrl?: string;
  explorerUrl: string;
  icon: string;         // "images/web3/networks/arbitrum.png"
  tokens: ERC20Token[];
};
