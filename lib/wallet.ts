// lib/wallet.ts
export function connectWallet() {
  if (typeof window === "undefined") return;

  const appKit = (window as any).appKit;
  if (!appKit) {
    console.error("AppKit not initialized");
    return;
  }

  appKit.open(); // 🔥 opens wallet selector (MetaMask on Android)
}
