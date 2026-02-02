import { validateNetwork } from "../connect"

export async function ensureNetwork(
  provider: any,
  chainId: number
) {
  const network = validateNetwork(chainId)

  const hexChainId = `0x${chainId.toString(16)}`

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }]
    })
  } catch (err: any) {
    // If network doesn't exist, add it
    if (err.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexChainId,
            chainName: network.name,
            nativeCurrency: network.nativeCurrency,
            rpcUrls: network.rpcUrls,
            blockExplorerUrls: network.blockExplorerUrls
          }
        ]
      })
    } else {
      throw err
    }
  }
}
