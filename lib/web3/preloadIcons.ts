import {
  getWalletIcons,
  getWalletBWIcons,
  getBNetworkIcons,
  getBNetworkBWIcons,
} from "@/lib/web3/wallets";

import { SUPPORTED_BNETWORKS } from "@/lib/web3/wallets/types/SupportedBNetworks";

/**
 * Preloads all wallet, network, and token icons into browser cache
 */
export const preloadIcons = (): void => {
  const urls: string[] = [];

  // Wallet icons
  urls.push(...getWalletIcons());
  urls.push(...getWalletBWIcons());

  // Network icons
  urls.push(...getBNetworkIcons());
  urls.push(...getBNetworkBWIcons());

  // Token icons (all networks)
  SUPPORTED_BNETWORKS.forEach((net) => {
    net.tokens.forEach((token) => {
      urls.push(token.icon);
      urls.push(token.bwIcon);
    });
  });

  // Fire browser preload
  urls.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
};
