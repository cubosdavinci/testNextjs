// components/auth/UnlinkGoogleButton.tsx
'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/clients/supabaseBrowser';
import { useSession } from '@/components/auth/useSession';
import type { UserIdentity } from '@supabase/supabase-js';
import { browserConsoleLog } from '@/lib/utils';

export default function UnlinkGoogleButton() {
  console.log("----------- Unlinking Google Button ---------------")
  const { user, sessionLoading } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Safely find Google identity
  const googleIdentity = user?.identities?.find(
    (identity): identity is UserIdentity => identity.provider === 'google'
  );

  browserConsoleLog("Google Identity: ", googleIdentity)


  // Only show button if:
  // 1. User is fully loaded
  // 2. Google is linked
  // 3. There is more than one identity (don't allow unlinking the last login method)
  const shouldShowButton = !sessionLoading && !!googleIdentity && (user?.identities?.length ?? 0) >= 2;

  const handleUnlinkGoogle = async () => {
    if (!googleIdentity || !user) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = supabaseBrowser();

      const { data, error: unlinkError } = await supabase.auth.unlinkIdentity(googleIdentity);

      if (unlinkError) {
        console.error('Unlink error:', unlinkError);
        setError(unlinkError.message);
      } else {
        console.log('✅ Google identity unlinked successfully', data);
        setSuccess(true);

        // Refresh session so useSession updates immediately
        await supabase.auth.refreshSession();
      }
    } catch (err: unknown) {
      console.error('Unexpected error while unlinking:', err);
      setError(err instanceof Error ? err.message : 'Failed to unlink Google account');
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
      {success && <p className="text-green-600 text-sm">✅ Google account has been unlinked.</p>}
    </div>
  );
}