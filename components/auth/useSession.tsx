'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser} from '@/lib/supabase/clients/supabaseBrowser'
import type { Session, User } from '@supabase/supabase-js'
import { useWallet } from '@solana/wallet-adapter-react'

export function useSession() {
  const supabase = useMemo(() => supabaseBrowser(), [])

  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [sessionError, setSessionError] = useState<Error | null>(null)
  const [isWalletAdapterSynchronized, setIsWalletAdapterSynchronized] = useState(false)

  const { publicKey, connected } = useWallet()

  // ─── Load session and subscribe to auth changes ─────────────────────────
  useEffect(() => {
    let isMounted = true

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        if (!isMounted) return

        setSession(data.session)
        setUser(data.session?.user ?? null)
        setSessionError(null)
      } catch (err) {
        if (!isMounted) return
        setSession(null)
        setUser(null)
        setSessionError(err instanceof Error ? err : new Error('Unknown session error'))
      } finally {
        if (isMounted) setSessionLoading(false)
      }
    }

    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setSessionError(null)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  // ─── Synchronize wallet with user address ─────────────────────────────
  useEffect(() => {
    if (!user || !publicKey || !connected) {
      setIsWalletAdapterSynchronized(false)
      return
    }

    const userAddress = user.user_metadata?.custom_claims?.address
    if (!userAddress) {
      setIsWalletAdapterSynchronized(false)
      return
    }

    // Update sync state whenever publicKey changes
    setIsWalletAdapterSynchronized(userAddress === publicKey.toString())
    console.log("Changing PublicKey")
  }, [publicKey, connected, user])

  // ─── Web3 sign-in helper ──────────────────────────────────────────────
  const signInWithWeb3Account = async ({
    chain,
    message,
    signature,
  }: 
    | { chain: 'ethereum'; message: string; signature: `0x${string}` }
    | { chain: 'solana'; message: string; signature: Uint8Array }
  ) => {
    try {
       let response
      if (chain === 'ethereum') {
        response = await supabase.auth.signInWithWeb3({ chain: 'ethereum', message, signature })
      } else if (chain === 'solana') {
        response = await supabase.auth.signInWithWeb3({ chain: 'solana', message, signature })
      }

      if (response?.data?.session) {
        setSession(response.data.session)
        setUser(response.data.session.user ?? null)
        setSessionError(null)
      }

      return response
    } catch (error) {
      console.error('[useSession][signInWithWeb3Account] Error:', error)
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
    }
  }

  return {
    session,
    user,
    sessionLoading,
    isWalletAdapterSynchronized,
    sessionError,
    signInWithWeb3Account,
  }
}