// lib/web3/wallets/types/SupportedBNetworks.ts

interface ERC20WatchAssetOptions {
    address: `0x${string}`;  // The hexadecimal address of the token contract
    chainId?: number; // The chain ID of the asset. If empty, defaults to the current chain ID.
}

export type ERC20Token = {
  symbol: string;         // "USDC"
  name: string;           // "USD Coin"
  decimals: number;      // 6 or 18
  icon: string;          // UI path
  bwIcon: string;          // UI path
  explorerUrl: string;  // Block explorer link
  erc20Type: string;          // "ERC20"
  erc20Options: ERC20WatchAssetOptions
};


export enum NetworkKey {
  Arbitrum = "Arbitrum One",
  Base = "Base",
  Optimism = "OP Mainnet",
  Amoy = "Polygon Amoy Testnet"
}

export interface AddEthereumChainParameter{
  chainId: string;
  blockExplorerUrls?: string[];
  chainName?: string;
  iconUrls?: string[];
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls?: string[];
}

export type BNetwork = {
  chainId: number
  icon: string
  bwIcon: string
  options: AddEthereumChainParameter
  tokens: ERC20Token[]
}

export const SUPPORTED_BNETWORKS: BNetwork[] = [
  {
    chainId: 42161,
    icon: "/images/web3/networks/arbitrum.png",
    bwIcon: "/images/web3/networks/bw-arbitrum.png",
    options: {
      chainId: "0xA4B1", // 42161
      chainName: "Arbitrum One",
      rpcUrls: [
        "https://arb1.arbitrum.io/rpc",
        "https://arbitrum-one.public.blastapi.io",
        "https://arbitrum-one-rpc.publicnode.com",
        "https://arbitrum.public.blockpi.network/v1/rpc/public",
        "https://1rpc.io/arb"
      ],
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18
      },
      blockExplorerUrls: ["https://arbiscan.io"],
      iconUrls: ["https://arbiscan.io/favicon.ico"]
    },
    tokens: [
      { 
        symbol: "USDC",
        name: "USD Coin",        
        decimals: 6,
        icon: "/images/web3/tokens/usdc.png",
        bwIcon: "/images/web3/tokens/bw-usdc.png",
        explorerUrl:
          "https://arbiscan.io/token/0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        erc20Type: "ERC20",
        erc20Options: {
          address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
          chainId: 42161
        },
      },      
      {
        symbol: "WETH",
        name: "Wrapped Ether",
        decimals: 18,
        icon: "/images/web3/tokens/weth.png",
        bwIcon: "/images/web3/tokens/bw-weth.png",
        explorerUrl:
          "https://arbiscan.io/token/0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        erc20Type: "ERC20",
        erc20Options: {
          address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
          chainId: 42161
        },
      },
      {
        symbol: "DAI",
        name: "Dai Stablecoin",
        decimals: 18,
        icon: "/images/web3/tokens/dai.png",
        bwIcon: "/images/web3/tokens/bw-dai.png",
        explorerUrl: "https://arbiscan.io/token/0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
        erc20Type: "ERC20",
        erc20Options: {
          address: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
          chainId: 42161
        },
      },
      {
        symbol: "USDT",
        name: "Tether USD",
        decimals: 6,
        icon: "/images/web3/tokens/usdt.png",
        bwIcon: "/images/web3/tokens/bw-usdt.png",
        explorerUrl: "https://arbiscan.io/token/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        erc20Type: "ERC20",
        erc20Options: {
          address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
          chainId: 42161
        },
      },
    ],
  },
  {
    chainId: 8453,
    icon: "/images/web3/networks/base.png",
    bwIcon: "/images/web3/networks/bw-base.png",
    options: {
      chainId: "0x2105", // 8453 in hex
      chainName: "Base Mainnet",
      rpcUrls: [
        "https://mainnet.base.org",
        "https://base.llamarpc.com",
        "https://base-mainnet.diamondswap.org/rpc",
        "https://base.public.blockpi.network/v1/rpc/public",
        "https://1rpc.io/base"
      ],
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18
      },
      blockExplorerUrls: ["https://basescan.org"],
      iconUrls: ["https://basescan.org/favicon.ico"]
    },
    tokens: [
      {
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        icon: "/images/web3/tokens/usdc.png",
        bwIcon: "/images/web3/tokens/bw-usdc.png",
        explorerUrl: "https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        erc20Type: "ERC20",
        erc20Options: {
          address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          chainId: 8453
        },
      },
      {
        symbol: "WETH",
        name: "Wrapped Ether",
        decimals: 18,
        icon: "/images/web3/tokens/weth.png",
        bwIcon: "/images/web3/tokens/bw-weth.png",
        explorerUrl: "https://basescan.org/token/0x4200000000000000000000000000000000000006",
        erc20Type: "ERC20",
        erc20Options: {
          address: "0x4200000000000000000000000000000000000006",
          chainId: 8453
        },
      },
      {
        symbol: "DAI",
        name: "Dai Stablecoin",
        decimals: 18,
        icon: "/images/web3/tokens/dai.png",
        bwIcon: "/images/web3/tokens/bw-dai.png",
        explorerUrl: "https://basescan.org/token/0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
        erc20Type: "ERC20",
        erc20Options: {
          address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
          chainId: 8453
        },
        
      },
    ],
  },
  {
    chainId: 10,
    icon: "/images/web3/networks/optimism.png",
    bwIcon: "/images/web3/networks/bw-optimism.png",
    options: {
      chainId: "0xA", // 10 in hex
      chainName: "Optimism Mainnet",
      rpcUrls: [
        "https://mainnet.optimism.io",
        "https://optimism-mainnet.public.blastapi.io",
        "https://1rpc.io/op",
        "https://optimism-rpc.publicnode.com",
        "https://optimism.public.blockpi.network/v1/rpc/public"
      ],
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18
      },
      blockExplorerUrls: ["https://optimistic.etherscan.io"],
      iconUrls: ["https://optimistic.etherscan.io/favicon.ico"]
    },
    tokens: [
      {
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        icon: "/images/web3/tokens/usdc.png",
        bwIcon: "/images/web3/tokens/bw-usdc.png",
        explorerUrl: "https://optimistic.etherscan.io/token/0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        erc20Type: "ERC20",
        erc20Options: {
          address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
          chainId: 10
        },
      },
      {
        symbol: "WETH",
        name: "Wrapped Ether",
        decimals: 18,
        icon: "/images/web3/tokens/weth.png",
        bwIcon: "/images/web3/tokens/bw-weth.png",
        explorerUrl: "https://optimistic.etherscan.io/token/0x4200000000000000000000000000000000000006",
        erc20Type: "ERC20",
        erc20Options: {
          address: "0x4200000000000000000000000000000000000006",
          chainId: 10
        },
      },
      {
        symbol: "DAI",
        name: "Dai Stablecoin",
        decimals: 18,
        icon: "/images/web3/tokens/dai.png",
        bwIcon: "/images/web3/tokens/bw-dai.png",
        explorerUrl: "https://optimistic.etherscan.io/token/0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
        erc20Type: "ERC20",
        erc20Options: {
          address: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
          chainId: 10
        },
      },
      {
        symbol: "USDT",
        name: "Tether USD",
        decimals: 6,
        icon: "/images/web3/tokens/usdt.png",
        bwIcon: "/images/web3/tokens/bw-usdt.png",
        explorerUrl: "https://optimistic.etherscan.io/token/0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
        erc20Type: "ERC20",
        erc20Options: {
          address: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
          chainId: 10
        },
      },
    ],
  },
  {
    chainId: 80002,
    icon: "/images/web3/networks/amoy.png",
    bwIcon: "/images/web3/networks/bw-amoy.png",
     options: {
      chainId: "0x13882", // 80002 in hex
      chainName: "Polygon Amoy Testnet",
      rpcUrls: [
        "https://rpc-amoy.polygon.technology",
        "https://polygon-amoy-bor-rpc.publicnode.com",
        "https://polygon-amoy.blockpi.network/v1/rpc/public",
        "https://polygon-amoy.drpc.org",
        "https://poly-amoy-testnet.api.pocket.network"
      ],
      nativeCurrency: {
        name: "Polygon Amoy POL",
        symbol: "POL",
        decimals: 18
      },
      blockExplorerUrls: ["https://amoy.polygonscan.com"],
      iconUrls: ["https://amoy.polygonscan.com/favicon.ico"]
    },
    tokens: [
      {
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        icon: "/images/web3/tokens/usdc.png",
        bwIcon: "/images/web3/tokens/bw-usdc.png",
        explorerUrl: "https://amoy.polygonscan.com/token/0x8B0180f2101c8260d49339abfEe87927412494B4",
        erc20Type: "ERC20",
        erc20Options: {
          address: "0x8B0180f2101c8260d49339abfEe87927412494B4",
          chainId: 80002
        },
      },
      {
        symbol: "WETH",
        name: "Wrapped Ether",
        decimals: 18,
        icon: "/images/web3/tokens/weth.png",
        bwIcon: "/images/web3/tokens/bw-weth.png",
        explorerUrl: "https://amoy.polygonscan.com/token/0x52eF3d68BaB452a294342DC3e5f464d7f610f72E",
        erc20Type: "ERC20",
        erc20Options: {
          address: "0x52eF3d68BaB452a294342DC3e5f464d7f610f72E",
          chainId: 80002
        },
      },
    ],
  },
];

/*** BNetworks helpers ***/
export const getBNetworkNames = (): string[] => {
  return SUPPORTED_BNETWORKS.map((network) => network.options.chainName!);
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

export const getBNetworkUrls = (): string[] => {
  return SUPPORTED_BNETWORKS.map((network) => network.options.blockExplorerUrls![0]!);
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
  return network ? network.tokens.map((token) => token.erc20Options.address) : [];
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

export function getTokenSym(
  chain_id?: number,
  token_address?: string
): string | null {
  if (
    typeof chain_id !== "number" ||
    typeof token_address !== "string"
  ) {
    return null
  }

  const network = SUPPORTED_BNETWORKS.find(
    (n) => n.chainId === chain_id
  )

  if (!network) return null

  const token = network.tokens.find(
    (t) =>
      t.erc20Options.chainId === chain_id &&
      t.erc20Options.address.toLowerCase() === token_address.toLowerCase()
  )

  return token?.symbol ?? null
}

export function getTokenAddress(
  chainId: number,
  tokenSym: string
): string | null {
  if (typeof chainId !== "number" || !tokenSym) return null;

  const network = SUPPORTED_BNETWORKS.find(n => n.chainId === chainId);
  if (!network) return null;

  const token = network.tokens.find(
    t => t.symbol.toLowerCase() === tokenSym.toLowerCase()
  );

  return token?.erc20Options.address ?? null;
}

export type EIP3085CustNetwork = AddEthereumChainParameter;


