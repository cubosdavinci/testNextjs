import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { networks } from './networks'



if (!projectId) {
  throw new Error('Project ID is not defined')
}



export const config = wagmiAdapter.wagmiConfig
