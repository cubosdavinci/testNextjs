// lib/web3/SupportedWalletProviders.ts

export type WalletProvider = {
  key: string;        // "metamask"
  name: string;       // "MetaMask"
  icon: string;       // UI icon path
  isActive: boolean;
};

export const SUPPORTED_WALLET_PROVIDERS: WalletProvider[] = [
  {
    key: "metamask",
    name: "MetaMask",
    icon: "/images/web3/wallets/metamask.png",
    isActive: true,
  },
  {
    key: "coinbase",
    name: "Coinbase Wallet",
    icon: "/images/web3/wallets/coinbase.png",
    isActive: true,
  },
  {
    key: "trustwallet",
    name: "Trust Wallet",
    icon: "/images/web3/wallets/trustwallet.png",
    isActive: true,
  },
];

export const SUPPORTED_WALLET_PROVIDER_KEYS = SUPPORTED_WALLET_PROVIDERS.map(
  (p) => p.key
)
