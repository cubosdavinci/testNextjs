// lib/web3/wallets/types/SupportedBNetworks.ts
export type ERC20Token = {
  symbol: string;         // "USDC"
  name: string;           // "USD Coin"
  address: `0x${string}`; // On-chain contract
  decimals: number;      // 6 or 18
  icon: string;          // UI path
  bwIcon: string;          // UI path
  explorerUrl: string;  // Block explorer link
};

export type BNetwork = {
  chainId: number;
  key: string;
  name: string;
  shortName: string;
  rpcUrl?: string;
  explorerUrl: string;
  icon: string;
  bwIcon: string; 
  tokens: ERC20Token[];
};

export const SUPPORTED_BNETWORKS: BNetwork[] = [
  {
    chainId: 42161,
    key: "arbitrum",
    name: "Arbitrum One",
    shortName: "Arbitrum",
    explorerUrl: "https://arbiscan.io",
    icon: "/images/web3/networks/arbitrum.png",
    bwIcon: "/images/web3/networks/bw-arbitrum.png",
    tokens: [
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        decimals: 6,
        icon: "/images/web3/tokens/usdc.png",
        bwIcon: "/images/web3/tokens/bw-usdc.png",
        explorerUrl:
          "https://arbiscan.io/token/0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      },
      {
        symbol: "WETH",
        name: "Wrapped Ether",
        address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        decimals: 18,
        icon: "/images/web3/tokens/weth.png",
        bwIcon: "/images/web3/tokens/bw-weth.png",
        explorerUrl:
          "https://arbiscan.io/token/0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      },
      {
        symbol: "DAI",
        name: "Dai Stablecoin",
        address: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
        decimals: 18,
        icon: "/images/web3/tokens/dai.png",
        bwIcon: "/images/web3/tokens/bw-dai.png",
        explorerUrl:
          "https://arbiscan.io/token/0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      },
      {
        symbol: "USDT",
        name: "Tether USD",
        address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        decimals: 6,
        icon: "/images/web3/tokens/usdt.png",
        bwIcon: "/images/web3/tokens/bw-usdt.png",
        explorerUrl:
          "https://arbiscan.io/token/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      },
    ],
  },
  {
    chainId: 8453,
    key: "base",
    name: "Base",
    shortName: "Base",
    explorerUrl: "https://basescan.org",
    icon: "/images/web3/networks/base.png",
    bwIcon: "/images/web3/networks/bw-base.png",
    tokens: [
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        decimals: 6,
        icon: "/images/web3/tokens/usdc.png",
        bwIcon: "/images/web3/tokens/bw-usdc.png",
        explorerUrl:
          "https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      },
      {
        symbol: "WETH",
        name: "Wrapped Ether",
        address: "0x4200000000000000000000000000000000000006",
        decimals: 18,
        icon: "/images/web3/tokens/weth.png",
        bwIcon: "/images/web3/tokens/bw-weth.png",
        explorerUrl:
          "https://basescan.org/token/0x4200000000000000000000000000000000000006",
      },
      {
        symbol: "DAI",
        name: "Dai Stablecoin",
        address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
        decimals: 18,
        icon: "/images/web3/tokens/dai.png",
        bwIcon: "/images/web3/tokens/bw-dai.png",
        explorerUrl:
          "https://basescan.org/token/0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
      },
    ],
  },
  {
    chainId: 10,
    key: "optimism",
    name: "Optimism",
    shortName: "OP",
    explorerUrl: "https://optimistic.etherscan.io",
    icon: "/images/web3/networks/optimism.png",
    bwIcon: "/images/web3/networks/bw-optimism.png",
    tokens: [
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        decimals: 6,
        icon: "/images/web3/tokens/usdc.png",
        bwIcon: "/images/web3/tokens/bw-usdc.png",
        explorerUrl:
          "https://optimistic.etherscan.io/token/0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      },
      {
        symbol: "WETH",
        name: "Wrapped Ether",
        address: "0x4200000000000000000000000000000000000006",
        decimals: 18,
        icon: "/images/web3/tokens/weth.png",
        bwIcon: "/images/web3/tokens/bw-weth.png",
        explorerUrl:
          "https://optimistic.etherscan.io/token/0x4200000000000000000000000000000000000006",
      },
      {
        symbol: "DAI",
        name: "Dai Stablecoin",
        address: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
        decimals: 18,
        icon: "/images/web3/tokens/dai.png",
        bwIcon: "/images/web3/tokens/bw-dai.png",
        explorerUrl:
          "https://optimistic.etherscan.io/token/0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      },
      {
        symbol: "USDT",
        name: "Tether USD",
        address: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
        decimals: 6,
        icon: "/images/web3/tokens/usdt.png",
        bwIcon: "/images/web3/tokens/bw-usdt.png",
        explorerUrl:
          "https://optimistic.etherscan.io/token/0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
      },
    ],
  },
  {
    chainId: 80002,
    key: "amoy",
    name: "Amoy Testnet",
    shortName: "Amoy",
    explorerUrl: "https://www.oklink.com/amoy",
    icon: "/images/web3/networks/amoy.png",
    bwIcon: "/images/web3/networks/bw-amoy.png",
    tokens: [
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0x8B0180f2101c8260d49339abfEe87927412494B4",
        decimals: 6,
        icon: "/images/web3/tokens/usdc.png",
        bwIcon: "/images/web3/tokens/bw-usdc.png",
        explorerUrl:
          "https://www.oklink.com/amoy/token/0x8B0180f2101c8260d49339abfEe87927412494B4",
      },
      {
        symbol: "WETH",
        name: "Wrapped Ether",
        address: "0x52eF3d68BaB452a294342DC3e5f464d7f610f72E",
        decimals: 18,
        icon: "/images/web3/tokens/weth.png",
        bwIcon: "/images/web3/tokens/bw-weth.png",
        explorerUrl:
          "https://www.oklink.com/amoy/token/0x52eF3d68BaB452a294342DC3e5f464d7f610f72E",
      },
    ],
  },
];

/*** BNetworks helpers ***/

export const getBNetworkKeys = (): string[] => {
  return SUPPORTED_BNETWORKS.map((network) => network.key);
};

export const getBNetworkNames = (): string[] => {
  return SUPPORTED_BNETWORKS.map((network) => network.name);
};

export const getBNetworkChainIds = (): number[] => {
  return SUPPORTED_BNETWORKS.map((network) => network.chainId);
};

export const getBNetworkIcons = (): string[] => {
  return SUPPORTED_BNETWORKS.map((network) => network.icon);
};

export const getBNetworkBWIcons = (): string[] => {
  return SUPPORTED_BNETWORKS.map((network) => network.bwIcon);
};


/*** Token helpers ***/

const getNetworkByChainId = (chainId: number) => {
  return SUPPORTED_BNETWORKS.find(
    (network) => network.chainId === chainId
  );
};

export const getTokenKeys = (chainId: number): string[] => {
  const network = getNetworkByChainId(chainId);
  return network ? network.tokens.map((token) => token.symbol) : [];
};

export const getTokenNames = (chainId: number): string[] => {
  const network = getNetworkByChainId(chainId);
  return network ? network.tokens.map((token) => token.name) : [];
};

export const getTokenAddresses = (chainId: number): `0x${string}`[] => {
  const network = getNetworkByChainId(chainId);
  return network ? network.tokens.map((token) => token.address) : [];
};

export const getTokenDecimals = (chainId: number): number[] => {
  const network = getNetworkByChainId(chainId);
  return network ? network.tokens.map((token) => token.decimals) : [];
};

export const getTokenIcons = (chainId: number): string[] => {
  const network = getNetworkByChainId(chainId);
  return network ? network.tokens.map((token) => token.icon) : [];
};

export const getTokenBWIcons = (chainId: number): string[] => {
  const network = getNetworkByChainId(chainId);
  return network
    ? network.tokens.map((token) => {
        // Optional fallback: reuse icon if no bw version exists
        return token.bwIcon;
      })
    : [];
};

export const getTokenUrls = (chainId: number): string[] => {
  const network = getNetworkByChainId(chainId);
  return network
    ? network.tokens.map((token) => token.explorerUrl)
    : [];
};

