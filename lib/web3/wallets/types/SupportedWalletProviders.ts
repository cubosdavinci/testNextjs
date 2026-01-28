// lib/web3/wallets/types/SupportedWalletProviders.ts
export type SupportedWalletProvider = {
  rdns: string;        // "metamask"
  name: string;       // "MetaMask"
  colorIcon: string;       // UI icon path
  bwIcon: string;       // UI icon path
  isActive: boolean;
  extensionUrl: string;
  browsers: string[];   

};

export const SUPPORTED_WALLET_PROVIDERS: SupportedWalletProvider[] = [
  {
    rdns: "io.metamask",
    name: "MetaMask",
    colorIcon: "/images/web3/wallets/metamask.png",
    bwIcon: "/images/web3/wallets/bw-metamask.png",
    isActive: true,
    extensionUrl: "https://chrome.google.com/webstore/detal/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",
    browsers: ["chrome", "brave", "edge"],

     
   },
  {
    rdns: "com.coinbase.wallet",
    name: "Coinbase Wallet",
    colorIcon: "/images/web3/wallets/coinbase.png",
    bwIcon: "/images/web3/wallets/bw-coinbase.png",
    isActive: true,
    extensionUrl: "https://chromewebstore.google.com/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad",
    browsers: ["chrome", "brave", "edge"],
  },
  {
    rdns: "com.trustwallet.app",
    name: "Trust Wallet",
    colorIcon: "/images/web3/wallets/trustwallet.png",
    bwIcon: "/images/web3/wallets/bw-trustwallet.png",
    isActive: true,
    extensionUrl: "https://chrome.google.com/webstore/detail/trust-wallet/egjidjbpglichdcondbcbdnbeeppgdph",
    browsers: ["chrome", "brave", "edge"],
  },
];

export const SUPPORTED_WALLET_PROVIDER_KEYS = SUPPORTED_WALLET_PROVIDERS.map(
  (p) => p.rdns
)

  export const getWalletNames = (): string[] => {
    return SUPPORTED_WALLET_PROVIDERS.map((w) => w.name);
  };

  export const getWalletKeys = (): string[] => {
    return SUPPORTED_WALLET_PROVIDERS.map((w) => w.rdns);
  };

  export const getWalletIcons = (): string[] => {
    return SUPPORTED_WALLET_PROVIDERS.map((w) => w.colorIcon);
  };

  export const getWalletBWIcons = (): string[] => {
    return SUPPORTED_WALLET_PROVIDERS.map((w) => w.bwIcon);
  };
