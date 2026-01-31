// lib/web3/wallets/providers.ts
"use client";
export type Eip1193Provider = {
  // A method that takes a request object and returns a Promise
  request: (args: {
    method: string
    params?: unknown[] | object
  }) => Promise<unknown>

  // Optional event listener registration
  on?: (event: string, handler: (...args: any[]) => void) => void

  // Optional event listener removal
  removeListener?: (event: string, handler: (...args: any[]) => void) => void
}

export type DiscoveredWallet = {
  info: {
    uuid: string
    name: string
    icon: string
    rdns: string
  }
  provider: Eip1193Provider
}

/**
 * ---- EIP-6963 Discovery ----
 */
export async function detectWallets(): Promise<DiscoveredWallet[]> {
  return new Promise((resolve) => {
    const wallets: DiscoveredWallet[] = [];

    function handler(event: any) {
      wallets.push(event.detail);
    }

    window.addEventListener("eip6963:announceProvider", handler);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    setTimeout(() => {
      window.removeEventListener("eip6963:announceProvider", handler);
      resolve(wallets);
    }, 500);
  });
}