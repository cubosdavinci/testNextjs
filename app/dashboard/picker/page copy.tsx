'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/clients/supabaseBrowser';
import { browserConsoleLog } from '@/lib/utils';

import ErrorAlert from '@/components/banners/ErrorAlert';
import ConnectGoogle from '@/components/google/ConnectGoogle';
import GoogleDrivePicker from '@/components/auth/google/GoogleDrivePicker';

import { GoogleLinkedAccount } from '@/lib/services/google/GoogleAuthServiceTypes';

export default function DriveTestPage() {
  const [googleAccounts, setGoogleAccounts] = useState<GoogleLinkedAccount[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleError = (message: string) => {
    setError(message);
  };

  const handleCloseError = () => setError(null);

  useEffect(() => {
    const fetchLinkedAccounts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = supabaseBrowser();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('No authenticated user found.');
        }

        const res = await fetch(`/api/auth/google/get-linked-accounts?user_id=${user.id}`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();

        if (result.error) {
          throw new Error(result.error);
        }

        setGoogleAccounts(result.data?.google_linked_accounts ?? null);
      } catch (err: unknown) {
        const message = err instanceof Error
          ? err.message
          : 'Failed to load your Google linked accounts.';

        console.error('Error fetching linked Google accounts:', err);
        browserConsoleLog('Fetch Error', err);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkedAccounts();
  }, []);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-600">Loading your Google connections...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return <ErrorAlert message={error} onClose={handleCloseError} />;
  }

  const hasAccounts = googleAccounts && googleAccounts.length > 0;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Google Drive Test</h1>

      {hasAccounts ? (
        <div className="space-y-8">
          {/* Connected Accounts */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Connected Google Accounts</h2>
            <div className="space-y-4">
              {googleAccounts!.map((account) => (
                <div
                  key={account.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                >
                  <p className="text-green-700 font-medium">
                    ✅ Connected: <strong>{account.googleEmail}</strong>
                  </p>

                  {account.consentExpired && (
                    <p className="text-orange-600 mt-2 text-sm">
                      ⚠️ Consent has expired. Please reconnect your Google account.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Google Drive Picker */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Select File from Google Drive</h2>
            <GoogleDrivePicker
              googleLinkedAccounts={googleAccounts}
              onError={handleError}
            // onSuccess will be added later when you implement file download
            />
          </div>
        </div>
      ) : (
        /* No Accounts Connected */
        <div>
          <h2 className="text-lg font-semibold mb-4">No Google Account Connected</h2>
          <ConnectGoogle />
        </div>
      )}
    </div>
  );
}