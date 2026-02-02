import { EIP3085CustNetwork } from "wallet/types/SupportedBNetworks"

export async function ensureNetwork(
  provider: any,
  network: EIP3085CustNetwork
) {
  try {
    // Try switching first
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: network.chainId }]
    })
  } catch {
    // If it doesn't exist, add it
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [network]
    })
  }
}
