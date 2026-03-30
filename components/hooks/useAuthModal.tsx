"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import type { Session, User } from "@supabase/supabase-js";
import { createAnonClient } from "@/lib/supabase/client";

interface UseAuthModalOptions {
  redirect?: string;
  statement?: string; // optional custom statement (not heavily used for Solana)
}

interface UseAuthModalReturn {
  isSignedIn: boolean;
  loading: boolean;
  isError: boolean;
  error: Error | null;
  user: User | null;
  session: Session | null;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuthModal({ redirect }: UseAuthModalOptions = {}): UseAuthModalReturn {
  const router = useRouter();
  const supabase = createAnonClient();

  // Solana wallet adapter
  const { publicKey, connected, signMessage, wallet } = useWallet();

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  /** Update local user/session state */
  const updateState = useCallback((newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
    setIsSignedIn(!!newSession);
  }, []);

  /** Log errors */
  useEffect(() => {
    if (isError && error) {
      console.error("[useAuthModal] Error:", error);
    }
  }, [isError, error]);

  /** Listen for Supabase auth state changes */
  useEffect(() => {
    let isMounted = true;

    // Initial session fetch
    supabase.auth.getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        updateState(data.session);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("[useAuthModal] Failed to fetch session:", err);
        setIsError(true);
        setError(err as Error);
        setLoading(false);
      });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      updateState(newSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, updateState]);

  /** Web3 signature login (Solana) */
  const signIn = useCallback(async () => {
    setLoading(true);
    setIsError(false);
    setError(null);

    if (!connected || !publicKey || !signMessage) {
      const msg = "Wallet not connected or does not support signing";
      console.warn("[useAuthModal]", msg);
      setIsError(true);
      setError(new Error(msg));
      setLoading(false);
      return;
    }

    try {
      // Optional: You can still call a Supabase Edge Function if you want a dynamic message
      // For simplicity and consistency with your earlier page, we'll build the message client-side
      const domain = window.location.host;
      const uri = window.location.origin;
      const nonce = crypto.randomUUID();

      const message = `${domain} wants you to sign in with your Solana account:
${publicKey.toBase58()}

URI: ${uri}
Version: 1
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`;

      const messageBytes = new TextEncoder().encode(message);

      // Sign with Solana wallet
      const signature = await signMessage(messageBytes);

      // Verify via your existing Supabase function / helper
      const { data, error: verifyError } = await supabase.auth.signInWithWeb3?.({
        chain: "solana",
        message,
        signature,                 // Uint8Array - important!
      } as any); // Type assertion because Supabase types are Ethereum-heavy

      // Alternative: if you use signInWithWeb3Account from your session hook:
      // const { error: verifyError } = await signInWithWeb3Account({ chain: "solana", message, signature });

      if (verifyError) {
        throw verifyError;
      }

      console.log("[useAuthModal] Solana login successful for address:", publicKey.toBase58());

      if (redirect) {
        router.push(redirect);
      }
    } catch (err: unknown) {
      console.error("[useAuthModal] Solana sign-in failed:", err);
      setIsError(true);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, signMessage, supabase, router, redirect]);

  /** Logout */
  const logout = useCallback(async () => {
    setLoading(true);
    setIsError(false);
    setError(null);

    try {
      await supabase.auth.signOut();
      console.log("[useAuthModal] Logout successful");
      router.replace("/");
    } catch (err: unknown) {
      console.error("[useAuthModal] Logout failed:", err);
      setIsError(true);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  return {
    isSignedIn,
    loading,
    isError,
    error,
    user,
    session,
    signIn,
    logout,
  };
}