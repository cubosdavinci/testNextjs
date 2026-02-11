import { createAppKit } from '@reown/appkit/react'
import { wagmiAdapter, projectId } from './wagmi'
import { networks, defaultNetwork } from './networks'

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork,
  metadata: {
    name: 'My App',
    description: 'My App Description',
    url: 'https://example.com',
    icons: ['https://example.com/icon.png'],
  },
   defaultAssets: [
    { networkId: 'eip155:421613', address: '0xYourTokenAddressHere' },
  ],
  
})
