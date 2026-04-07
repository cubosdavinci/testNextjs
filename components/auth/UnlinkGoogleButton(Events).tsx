// components/auth/UnlinkGoogleButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/clients/supabaseBrowser';
import { useSession } from '@/components/auth/useSession';
import type { UserIdentity } from '@supabase/supabase-js';
import { browserConsoleLog } from '@/lib/utils';

export default function UnlinkGoogleButton() {
  browserConsoleLog("Unlinking Google Button")
  const { user, sessionLoading } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Show button only if Google is linked and user has at least 2 identities
  const shouldShowButton =
    !sessionLoading &&
    !!user &&
    user.identities?.some((i) => i.provider === 'google') &&
    (user.identities?.length ?? 0) >= 2;

  // Listen to auth state changes (best long-term solution)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseBrowser().auth.onAuthStateChange((event, session) => {
      //if (event === 'USER_UPDATED' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        console.log(`Auth event: ${event} - refreshing UI`);
        console.log('Session: ', session);
        // Your useSession hook should automatically pick this up
      //}
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUnlinkGoogle = async () => {
    if (!user) {
      setError("No active user session found");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = supabaseBrowser();

      // 1. Fetch fresh identities right before unlinking
      const { data: identitiesData, error: fetchError } = await supabase.auth.getUserIdentities();

      if (fetchError) {
        throw new Error(`Failed to fetch identities: ${fetchError.message}`);
      }

      const googleIdentity = identitiesData?.identities?.find(
        (identity): identity is UserIdentity => identity.provider === 'google'
      );

      if (!googleIdentity) {
        setError("Google account is not linked to this user");
        return;
      }

      // 2. Unlink the identity
      const { error: unlinkError } = await supabase.auth.unlinkIdentity(googleIdentity);

      if (unlinkError) {
        console.error('Unlink error:', unlinkError);
        setError(unlinkError.message || 'Failed to unlink Google account');
      } else {
        console.log('✅ Google identity unlinked successfully');

        setSuccess(true);

        // 3. Refresh session
        await supabase.auth.refreshSession();

        // Show success message for a moment, then reload to ensure UI is fully updated
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err: unknown) {
      console.error('Unexpected error while unlinking:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!shouldShowButton) return null;

  return (
    <div className="mt-6 space-y-3">
      <p className="text-sm text-gray-600">
        Remove your linked Google account. You will no longer be able to sign in with Google.
      </p>

      <button
        onClick={handleUnlinkGoogle}
        disabled={loading}
        className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-50"
      >
        {loading ? "Unlinking..." : "🗑️ Unlink Google Account"}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">✅ Google account has been unlinked successfully.</p>}
    </div>
  );
}