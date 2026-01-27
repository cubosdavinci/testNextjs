export type WalletSession = {
  providerKey: string
  address: string | null
  chainId: number | null
  isConnected: boolean
  isInstalled: boolean
}
