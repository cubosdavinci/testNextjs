'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import UniversalProvider from '@walletconnect/universal-provider'
import { createAppKit } from '@reown/appkit'
import { arbitrumSepolia } from '@reown/appkit/networks'

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

const projectId =
  process.env.NEXT_PUBLIC_PROJECT_ID ||
  'b56e18d47c72ab683b10814fe9495694' // fallback for localhost

if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not defined')
}

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface AppKitContextType {
  provider: InstanceType<typeof UniversalProvider> | null
  modal: ReturnType<typeof createAppKit> | null
  session: any | null
  ready: boolean
}

/* -------------------------------------------------------------------------- */
/*                                  CONTEXT                                   */
/* -------------------------------------------------------------------------- */

const AppKitContext = createContext<AppKitContextType>({
  provider: null,
  modal: null,
  session: null,
  ready: false,
})

/* -------------------------------------------------------------------------- */
/*                                PROVIDER                                    */
/* -------------------------------------------------------------------------- */

export function AppKitProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] =
    useState<InstanceType<typeof UniversalProvider> | null>(null)

  const [modal, setModal] =
    useState<ReturnType<typeof createAppKit> | null>(null)

  const [session, setSession] = useState<any>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let mounted = true

    const init = async () => {
      // 1️⃣ Initialize provider (restores session from IndexedDB automatically)
      const universalProvider = await UniversalProvider.init({
        projectId,
        metadata: {
          name: 'My App',
          description: 'My App Description',
          url: window.location.origin,
          icons: ['https://example.com/icon.png'],
        },
      })

      if (!mounted) return

      // 2️⃣ Create modal
      const appKitModal = createAppKit({
        projectId,
        networks: [arbitrumSepolia],
      })

      // 3️⃣ Restore existing session (if any)
      if (universalProvider.session) {
        setSession(universalProvider.session)
      }

      // 4️⃣ Listen for new connections
      universalProvider.on('connect', (newSession: any) => {
        setSession(newSession.session ?? newSession)
        appKitModal.close()
      })

      // 5️⃣ Listen for disconnect
      universalProvider.on('disconnect', () => {
        setSession(null)
      })

      // 6️⃣ Display QR when needed
      universalProvider.on('display_uri', (uri: string) => {
        appKitModal.open({ uri })
      })

      setProvider(universalProvider)
      setModal(appKitModal)
      setReady(true)
    }

    init()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <AppKitContext.Provider
      value={{
        provider,
        modal,
        session,
        ready,
      }}
    >
      {children}
    </AppKitContext.Provider>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   HOOK                                     */
/* -------------------------------------------------------------------------- */

export function useAppKit() {
  return useContext(AppKitContext)
}
