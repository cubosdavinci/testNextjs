import { connectWallet } from "./connect"
import { attachWalletEvents } from "./events"

export class WalletSessionController {
  private provider: any
  private state = {
    address: null as string | null,
    chainId: null as number | null,
    isConnected: false
  }

  constructor(provider: any) {
    this.provider = provider
  }

  getState() {
    return { ...this.state }
  }

  async connect() {
    const { address, chainId } = await connectWallet(this.provider)

    this.state = {
      address,
      chainId,
      isConnected: true
    }

    return this.getState()
  }

  watch(onChange: (state: typeof this.state) => void) {
    return attachWalletEvents(this.provider, {
      onAccountsChanged: (accounts) => {
        if (!accounts.length) {
          this.state = {
            address: null,
            chainId: null,
            isConnected: false
          }
        } else {
          this.state.address = accounts[0]
        }
        onChange(this.getState())
      },

      onChainChanged: (chainId) => {
        this.state.chainId = chainId
        onChange(this.getState())
      },

      onDisconnect: () => {
        this.state = {
          address: null,
          chainId: null,
          isConnected: false
        }
        onChange(this.getState())
      }
    })
  }
}
