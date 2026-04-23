import { useState, useEffect, useCallback } from 'react';
import { GoogleLinkedAccount } from '@/lib/services/google/GoogleAuthServiceTypes';
import { supabaseBrowser } from '@/lib/supabase/clients/supabaseBrowser';

export const useGoogleAccounts = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Token error
    const [error, setError] = useState<{ status: boolean; description: string | null }>({
        status: false,
        description: null
    });

    // 🔥 NEW: Accounts state
    const [googleAccounts, setGoogleAccounts] = useState<GoogleLinkedAccount[] | null>(null);
    const [isRefreshingAccounts, setIsRefreshingAccounts] = useState(false);
    const [accountsError, setAccountsError] = useState<{ status: boolean; description: string | null }>({
        status: false,
        description: null
    });

    // 🔥 NEW: Fetch accounts
    const fetchAccounts = useCallback(async () => {
        setIsRefreshingAccounts(true);
        setAccountsError({ status: false, description: null });

        try {
            const supabase = supabaseBrowser();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No authenticated user found.');

            const res = await fetch(`/api/auth/google/get-linked-accounts?user_id=${user.id}`);
            const result = await res.json();

            if (result.error) throw new Error(result.error);

            setGoogleAccounts(result.data?.google_linked_accounts ?? []);
        } catch (err) {
            const description = err instanceof Error ? err.message : 'Failed to load accounts';
            setAccountsError({ status: true, description });
        } finally {
            setIsRefreshingAccounts(false);
        }
    }, []);

    // NEW: Remove linked account (for the X button)
    const removeLinkedAccount = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/auth/google/remove-linked-account?id=${id}`, {
                method: 'DELETE', // or POST if your API expects it
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to remove account');
            }

            // Success: data = null → remove from local state
            setGoogleAccounts(prev => prev ? prev.filter(acc => acc.id !== id) : null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to remove account';
            alert(message); // or use a toast
            // Optionally refetch on error
            // await fetchAccounts();
        }
    }, []);

    // NEW: Disconnect linked account (when consent is valid)
    const disconnectLinkedAccount = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/auth/google/disconnect-linked-account?id=${id}`, {
                method: 'POST', // adjust if your API uses DELETE
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to disconnect account');
            }

            // Success: update with new list from server
            setGoogleAccounts(result.data?.google_linked_accounts ?? []);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to disconnect account';
            alert(message);
        }
    }, []);

    // Auto fetch on mount
    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    // Existing function
    const getValidToken = async (account: GoogleLinkedAccount): Promise<GoogleLinkedAccount> => {
        setError({ status: false, description: null });

        const FIVE_MINUTES_MS = 5 * 60 * 1000;
        const isExpiringSoon = account.expiresAt
            ? Date.now() + FIVE_MINUTES_MS > account.expiresAt
            : false;

        if (!isExpiringSoon) return account;

        setIsRefreshing(true);
        try {
            const res = await fetch('/api/auth/google/access-token', {
                method: 'POST',
                body: JSON.stringify({ accountId: account.id }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to refresh token');

            return {
                ...account,
                accessToken: data.newAccessToken,
                expiresAt: data.newExpiresAt
            };
        } catch (err) {
            const description = err instanceof Error ? err.message : 'Session expired.';
            setError({ status: true, description });
            throw new Error(description);
        } finally {
            setIsRefreshing(false);
        }
    };

    return {
        // token
        getValidToken,
        isRefreshing,
        getValidTokenError: error.status,
        getValidTokenErrorDescription: error.description,

        // 🔥 accounts
        googleAccounts,
        isRefreshingAccounts,
        getAccountsError: accountsError.status,
        getAccountsErrorDescription: accountsError.description,
        refetchAccounts: fetchAccounts,
        removeLinkedAccount,
        disconnectLinkedAccount,
    };
};