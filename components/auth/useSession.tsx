'use client'

import { useEffect, useMemo, useState } from 'react'
import { createAnonClient } from '@/lib/supabase/client'
import type { Session, User } from '@supabase/supabase-js'

/**
 * useSession
 *
 * Client-side hook that provides the current Supabase session and user.
 * Acts as a singleton-like access point to auth state across the app.
 *
 * Features:
 * - Fetches the initial session on mount
 * - Subscribes to auth state changes
 * - Exposes session loading and error states
 * - Provides signInWithWeb3Account for web3 signature verification
 *
 * Note:
 * This hook is client-only and should not be used for server-side
 * authorization or data protection.
 */
export function useSession() {
  const supabase = useMemo(() => createAnonClient(), [])

  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null | undefined>(undefined) // ✅ undefined initial state
  const [sessionLoading, setSessionLoading] = useState(true)
  const [sessionError, setSessionError] = useState<Error | null>(null)

  useEffect(() => {
    console.log('useSession hook executed')
    let isMounted = true

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        if (!isMounted) return

        setSession(data.session)
        setUser(data.session?.user ?? null) // undefined → null if no session
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setSessionError(null)
    })

    return () => {
      console.log('useSession cleanup (unmounted)')
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  /**
   * signInWithWeb3Account
   *
   * Verifies a web3 account signature without signing the user in.
   * Mirrors Supabase response: { data, error }.
   *
   * @param chain 'ethereum' | 'solana'
   * @param message The exact message signed by the wallet (required)
   * @param signature The signature string from the wallet
   */
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

      // ✅ Update hook state automatically if session returned
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

  return { session, user, sessionLoading, sessionError, signInWithWeb3Account }
}
