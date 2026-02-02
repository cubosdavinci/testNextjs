import { WalletRepository } from "./db/repository"
import { detectWallets, DiscoveredWallet, Eip1193Provider } from "./providers"
import { onboardWallet } from "./connect"
import { NewWalletInput } from "./db/types/NewWalletInput"

export class WalletService {
  private repo = new WalletRepository()

  async discoverProviders() {
    return detectWallets()
  }

  async getSignedInUser(): Promise<string> {
    return this.repo.getSignedInUser()
  }
  
  async connectAndSaveWallet(params: {
    user_id: string
    provider: Eip1193Provider
    wallet_provider: string
    wallet_address: string | undefined
    chain_id: number
    token: {
      address: string
      symbol: string
      decimals: number
      icon?: string
    }
  }) {
    const session = await onboardWallet({
      provider: params.provider,
      expectedChainId: params.chain_id,
      token: params.token
    })

    const input = new NewWalletInput(
      params.user_id,
      params.wallet_provider,
      session.address,
      session.chainId,
      params.token.address,
      params.token.symbol
    )

    return this.repo.addWallet(input.toJSON())
  }
}
