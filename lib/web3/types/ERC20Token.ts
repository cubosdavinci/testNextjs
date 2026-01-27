// lib/web3/types/erc20Token.ts

export type ERC20Token = {
  symbol: string;         // "USDC"
  name: string;           // "USD Coin"
  address: `0x${string}`; // On-chain contract
  decimals: number;      // 6 or 18
  icon: string;          // UI path
  explorerUrl: string;  // Block explorer link
};
