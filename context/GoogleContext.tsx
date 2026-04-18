// context/GoogleContext.tsx
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

  // Methods
  clearError: () => void; 
  refreshAccounts: () => Promise<void>;
  connectWithCode: (code: string) => Promise<void>;
  getValidToken: (account: GoogleLinkedAccount) => Promise<GoogleLinkedAccount>;
  removeLinkedAccount: (id: string) => Promise<void>;
  disconnectLinkedAccount: (id: string) => Promise<void>;

  // Token State
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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

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

  // 🔹 Remove Account
  const removeLinkedAccount = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/auth/google/remove-linked-account?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove account');
      setGoogleAccounts(prev => prev ? prev.filter(acc => acc.id !== id) : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error removing account');
    }
  }, []);

  // 🔹 Disconnect Account
  const disconnectLinkedAccount = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/auth/google/disconnect-linked-account?id=${id}`, { method: 'POST' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to disconnect account');
      setGoogleAccounts(result.data?.google_linked_accounts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error disconnecting account');
    }
  }, []);

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
      await refreshAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      throw err;
    }
  }, [refreshAccounts]);

  // 🔹 Token refresh
  const getValidToken = useCallback(async (account: GoogleLinkedAccount) => {
    setTokenError(null);
    const FIVE_MINUTES = 5 * 60 * 1000;
    const isExpiringSoon = account.expiresAt ? Date.now() + FIVE_MINUTES > account.expiresAt : false;

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

      const updatedAccount = { ...account, accessToken: data.newAccessToken, expiresAt: data.newExpiresAt };
      setGoogleAccounts(prev => prev?.map(acc => acc.id === account.id ? updatedAccount : acc) ?? null);
      return updatedAccount;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Session expired';
      setTokenError(msg);
      throw err;
    } finally {
      setIsRefreshingToken(false);
    }
  }, []);

  useEffect(() => { refreshAccounts(); }, [refreshAccounts]);

  return (
    <GoogleContext.Provider
      value={{
        googleAccounts,
        isLoading,
        error,
        clearError,
        canConnect: (googleAccounts?.length ?? 0) < MAX_ACCOUNTS,
        refreshAccounts,
        connectWithCode,
        getValidToken,
        removeLinkedAccount,
        disconnectLinkedAccount,
        isRefreshingToken,
        tokenError
      }}
    >
      {children}
    </GoogleContext.Provider>
  );
}

export function useGoogle() {
  const context = useContext(GoogleContext);
  if (!context) throw new Error('useGoogle must be used inside GoogleProvider');
  return context;
}