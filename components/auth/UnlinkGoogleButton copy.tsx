// components/auth/UnlinkGoogleButton.tsx
'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/clients/supabaseBrowser';
import { useSession } from '@/components/auth/useSession';
import { UserIdentity } from '@supabase/supabase-js';

export default function UnlinkGoogleButton() {
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Only show if Google is linked
   const googleIdentity = user!.identities!.find(
        (identity): identity is UserIdentity => identity.provider === 'google'
      );
  
  const shouldShowButton = !!googleIdentity && user?.identities && user.identities.length >= 2;

  const handleUnlinkGoogle = async () => {
    if (!googleIdentity) return;

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
        
        // Optional: Refresh session so your useSession hook updates immediately
        await supabase.auth.refreshSession();
      }
    } catch (err: unknown) {
      console.error('Unexpected error:', err);
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