// components / auth / google / ConnectGoogle.tsx
'use client';

import { useState, useCallback } from "react";
import { browserConsoleLog } from "@/lib/utils";
import ErrorAlert from "@/components/banners/ErrorAlert";

export default function ConnectGoogle() {
  const [error, setError] = useState<string | null>(null);
  const clearError = useCallback(() => setError(null), []);

  const handleConnect = () => {
    if (!window.google?.accounts?.oauth2) {
      setError('Google SDK not loaded');
      return;
    }

    const client = window.google.accounts.oauth2.initCodeClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      scope: 'openid https://www.googleapis.com/auth/drive.file email profile',
      ux_mode: 'popup',
      access_type: 'offline',
      prompt: 'consent',
      callback: async (response) => {
        if (response.code) {
          try {
            const res = await fetch('/api/auth/google/callback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: response.code }),
            });

            if (!res.ok) throw new Error('Failed to save connection');
          } catch (err) {
            setError('Error sending code to server');
            console.error('Error sending code to server', err);
          }
        } else {
          setError('No code received from Google');
        }
      },
    });

    try {
      client.requestCode();
    } catch (err) {
      setError('Could not open the login window');
      browserConsoleLog('Popup trigger error');
    }
  };

  return (
    // Wrap in a fragment <> or div to return multiple elements
    <>
      {error && <ErrorAlert message={error} onClose={clearError} />
      }

      <button
        onClick={handleConnect}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Connect Google Drive
      </button>
    </>
  );
}