// components/auth/LinkGoogleButton.tsx
'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/clients/supabaseBrowser';
import { useSession } from '@/components/auth/useSession';
import { browserConsoleLog } from '@/lib/utils';

export default function LinkGoogleButton() {
  console.log("----------- Linking Google Button ---------------")
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show button only if user is signed in and has no email yet
  const shouldShowButton = !!user && !user.email;

  const handleLinkGoogle = async () => {
    if (!user) {
      setError("You must be signed in first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = supabaseBrowser();
      browserConsoleLog("Window Location Origin: ", window.location.origin)

      const { error: linkError } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback/google`,
          scopes: 'https://www.googleapis.com/auth/youtube.readonly',
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
        },
      });

      if (linkError) {
        console.error('linkIdentity error:', linkError);
        setError(linkError.message || 'Failed to start Google linking.');
      }
      // If no error → Supabase automatically redirects to Google
    } catch (err: unknown) {
      console.error('Unexpected error during linkIdentity:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!shouldShowButton) return null;

  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm text-gray-600">
        Link a Google account to add email support and YouTube read access.
      </p>

      <button
        onClick={handleLinkGoogle}
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? "Preparing Google link..." : "🔗 Link Google Account"}
      </button>

      {error && <p className="text-red-600 text-sm text-center">{error}</p>}
    </div>
  );
}