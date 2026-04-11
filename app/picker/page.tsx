'use client';

import { useState, useEffect } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import { supabaseBrowser } from "@/lib/supabase/clients/supabaseBrowser";
import { browserConsoleLog } from '@/lib/utils';
import ErrorAlert from "@/components/banners/ErrorAlert";
import { GoogleLinkedAccount } from '@/lib/services/google/GoogleAuthServiceTypes';
import ConnectGoogle from '@/components/auth/google/ConnectGoogle';

export default function DriveTestPage() {
  const [openPicker] = useDrivePicker();

  const [googleAccounts, setGoogleAccounts] = useState<GoogleLinkedAccount[] | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleCloseError = () => {
    setError(null);
  };

  useEffect(() => {
    async function fetchLinkedAccounts() {
      setError(null);
      setIsLoading(true);

      try {
        const supabase = supabaseBrowser();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("No authenticated user found.");
        }

        const res = await fetch(`/api/auth/google/get-linked-accounts?user_id=${user.id}`);

        const result = await res.json();

        // Handle API error response: { error: "Supabase query error" }
        if (result.error) {
          throw new Error(result.error);
        }

        // Success case
        const accounts = result.data?.google_linked_accounts ?? null;
        setGoogleAccounts(accounts);

        if (accounts && accounts.length > 0) {
          const primaryAccount = accounts[0];

          if (primaryAccount.accessToken) {
            setGoogleToken(primaryAccount.accessToken);
          } else if (primaryAccount.id) {
            // Fallback token refresh
            const tokenRes = await fetch(`/api/google/picker-token?id=${primaryAccount.id}`);
            if (tokenRes.ok) {
              const refreshed = await tokenRes.json();
              setGoogleToken(refreshed.accessToken ?? null);
            }
          }
        } else {
          setGoogleToken(null);
        }
      } catch (err: unknown) {
        const message = err instanceof Error
          ? err.message
          : "Failed to load your Google account information.";

        console.error("Error fetching linked Google accounts:", err);
        setError(message);
        browserConsoleLog("Fetch Error", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLinkedAccounts();
  }, []);

  if (isLoading) {
    return <div>Loading connection status...</div>;
  }

  return (
    <div>
      <ErrorAlert
        message={error}
        onClose={handleCloseError}
      />

      {!error && (
        <>
          {googleAccounts && googleAccounts.length > 0 ? (
            <div>
              {googleAccounts.map((account) => (
                <div key={account.id} className="mb-4">
                  <p>
                    ✅ Google account connected: <strong>{account.googleEmail}</strong>
                  </p>
                  {account.consentExpired && (
                    <p className="text-orange-600">
                      ⚠️ Consent has expired. Please reconnect your Google account.
                    </p>
                  )}
                </div>
              ))}

              {googleToken && (
                <p className="text-green-600">Access token is ready for Google Drive Picker</p>
              )}
            </div>
          ) : (
            <ConnectGoogle />
          )}

          {/* Rest of your UI / picker logic can go here if needed */}
        </>
      )}
    </div>
  );
}