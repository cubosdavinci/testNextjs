import { useState } from 'react';
import { GoogleLinkedAccount } from '@/lib/services/google/GoogleAuthServiceTypes';

export const useGoogleToken = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<{ status: boolean; description: string | null }>({
        status: false,
        description: null
    });

    const getValidToken = async (account: GoogleLinkedAccount): Promise<GoogleLinkedAccount> => {
        // Reset error state on new request
        setError({ status: false, description: null });

        const FIVE_MINUTES_MS = 5 * 60 * 1000;
        const isExpiringSoon = account.expiresAt
            ? Date.now() + FIVE_MINUTES_MS > account.expiresAt
            : false;

        if (!isExpiringSoon) return account;

        setIsRefreshing(true);
        try {
            const res = await fetch('/api/auth/google/refreshAccessToken', {
                method: 'POST',
                body: JSON.stringify({ accountId: account.id }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to refresh token');

            // Return updated account object
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

    return { getValidToken, isRefreshing, getValidTokenError: error.status, getValidTokenErrorDescription: error.description };
};