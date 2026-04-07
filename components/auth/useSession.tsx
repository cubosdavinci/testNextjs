'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabaseBrowser } from '@/lib/supabase/clients/supabaseBrowser';
import type { Session, User } from '@supabase/supabase-js';
import { useWallet } from '@solana/wallet-adapter-react';

export function useSession() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState<Error | null>(null);
  const [isWalletAdapterSynchronized, setIsWalletAdapterSynchronized] = useState(false);

  const { publicKey, connected } = useWallet();

  // Main auth listener + initial session load
  useEffect(() => {
    let isMounted = true;

    const loadInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!isMounted) return;

        setSession(data.session);
        setUser(data.session?.user ?? null);
        setSessionError(null);
      } catch (err) {
        if (!isMounted) return;
        setSession(null);
        setUser(null);
        setSessionError(err instanceof Error ? err : new Error('Failed to load session'));
      } finally {
        if (isMounted) setSessionLoading(false);
      }
    };

    loadInitialSession();

    // Listen to ALL auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log(`[useSession] Auth event: ${event}`);

        if (!isMounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);
        setSessionError(null);

        // Optional: Force reload identities after important events
        if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'SIGNED_IN') {
          console.log(`[useSession] Refreshing user data after ${event}`);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Wallet synchronization
  useEffect(() => {
    if (!user || !publicKey || !connected) {
      setIsWalletAdapterSynchronized(false);
      return;
    }

    const userAddress = user.user_metadata?.custom_claims?.address as string | undefined;
    const isSynced = userAddress === publicKey.toString();

    setIsWalletAdapterSynchronized(isSynced);

    if (!isSynced) {
      console.log('[useSession] Wallet address mismatch');
    }
  }, [user, publicKey, connected]);

  // Helper to manually refresh session (useful after unlinkIdentity, linkIdentity, etc.)
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      setSession(data.session);
      setUser(data.session?.user ?? null);
      return data;
    } catch (err) {
      console.error('[useSession] refreshSession failed:', err);
      setSessionError(err instanceof Error ? err : new Error('Failed to refresh session'));
      return null;
    }
  }, [supabase]);

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
    sessionError,
    isWalletAdapterSynchronized,
    refreshSession,           // ← New: expose this so components can call it
    signInWithWeb3Account,
  };
}