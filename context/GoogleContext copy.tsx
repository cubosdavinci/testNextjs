'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { GoogleLinkedAccount } from '@/lib/services/google/GoogleAuthServiceTypes';
import { supabaseBrowser } from '@/lib/supabase/clients/supabaseBrowser';

const MAX_ACCOUNTS = 5;

interface GoogleContextType {
  googleAccounts: GoogleLinkedAccount[] | null;
  isLoading: boolean;
  error: string | null;

  canConnect: boolean;

  refreshAccounts: () => Promise<void>;
  connectWithCode: (code: string) => Promise<void>;
  getValidToken: (account: GoogleLinkedAccount) => Promise<GoogleLinkedAccount>;

  isRefreshingToken: boolean;
  tokenError: string | null;
}

const GoogleContext = createContext<GoogleContextType | null>(null);

export function GoogleProvider({ children }: { children: React.ReactNode }) {
  const [googleAccounts, setGoogleAccounts] = useState<GoogleLinkedAccount[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // 🔹 Fetch accounts
  const refreshAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = supabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('No authenticated user');

      const res = await fetch(`/api/auth/google/get-linked-accounts?user_id=${user.id}`);
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Failed to fetch accounts');

      setGoogleAccounts(result.data?.google_linked_accounts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  // 🔹 Connect
  const connectWithCode = useCallback(async (code: string) => {
    try {
      const res = await fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        if (res.status === 409) throw new Error('Account already connected');
        throw new Error('Failed to connect account');
      }

      await refreshAccounts(); // 🔥 auto-sync
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      throw err;
    }
  }, [refreshAccounts]);

  // 🔹 Token refresh
  const getValidToken = useCallback(async (account: GoogleLinkedAccount) => {
    setTokenError(null);

    const FIVE_MINUTES = 5 * 60 * 1000;
    const isExpiringSoon = account.expiresAt
      ? Date.now() + FIVE_MINUTES > account.expiresAt
      : false;

    if (!isExpiringSoon) return account;

    setIsRefreshingToken(true);

    try {
      const res = await fetch('/api/auth/google/refreshAccessToken', {
        method: 'POST',
        body: JSON.stringify({ accountId: account.id }),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to refresh token');

      const updatedAccount = {
        ...account,
        accessToken: data.newAccessToken,
        expiresAt: data.newExpiresAt
      };

      // 🔥 Update global state
      setGoogleAccounts(prev =>
        prev?.map(acc => acc.id === account.id ? updatedAccount : acc) ?? null
      );

      return updatedAccount;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Session expired';
      setTokenError(msg);
      throw err;
    } finally {
      setIsRefreshingToken(false);
    }
  }, []);

  const canConnect = (googleAccounts?.length ?? 0) < MAX_ACCOUNTS;

  return (
    <GoogleContext.Provider
      value={{
        googleAccounts,
        isLoading,
        error,
        canConnect,
        refreshAccounts,
        connectWithCode,
        getValidToken,
        isRefreshingToken,
        tokenError
      }}
    >
      {children}
    </GoogleContext.Provider>
  );
}

// 🔹 Hook
export function useGoogle() {
  const context = useContext(GoogleContext);
  if (!context) throw new Error('useGoogle must be used inside GoogleProvider');
  return context;
}