"use client"

import { useEffect, useState } from "react"
import { WalletSessionController } from "./session"

export function useWalletSession(provider: any) {
  const [state, setState] = useState({
    address: null as string | null,
    chainId: null as number | null,
    isConnected: false
  })

  useEffect(() => {
    if (!provider) return

    const controller = new WalletSessionController(provider)

    controller.watch(setState)

    return () => {}
  }, [provider])

  return {
    ...state,
    connect: async () => {
      const controller = new WalletSessionController(provider)
      return controller.connect()
    }
  }
}
