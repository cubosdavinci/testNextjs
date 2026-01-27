export function attachWalletEvents(
  provider: any,
  handlers: {
    onAccountsChanged?: (accounts: string[]) => void
    onChainChanged?: (chainId: number) => void
    onDisconnect?: () => void
  }
) {
  if (!provider?.on) return

  provider.on("accountsChanged", handlers.onAccountsChanged)
  provider.on("chainChanged", (hexId: string) => {
    handlers.onChainChanged?.(parseInt(hexId, 16))
  })
  provider.on("disconnect", handlers.onDisconnect)

  return () => {
    provider.removeListener("accountsChanged", handlers.onAccountsChanged)
    provider.removeListener("chainChanged", handlers.onChainChanged)
    provider.removeListener("disconnect", handlers.onDisconnect)
  }
}
