'use client';

import { useGoogle } from '@/context/GoogleContext';
import ErrorAlert from '@/components/banners/ErrorAlert';

interface ConnectGoogleProps {
  sub?: string;
}

export default function ConnectGoogle({ sub }: ConnectGoogleProps) {
  const { canConnect, connectWithCode, error, clearError } = useGoogle();

  const handleConnect = () => {
    const client = window?.google?.accounts.oauth2.initCodeClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      scope: 'openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly',
      // Hint at the account and force consent if we are "reconnecting"
      ...(sub && { login_hint: sub, prompt: 'consent' }),
      callback: (response) => {
        if (response.code) {
          connectWithCode(response.code);
        }
      },
    });

    client?.requestCode();
  };

  if (!canConnect) {
    return <p>Max linked Google accounts reached (5)</p>;
  }

  return (
    <>
      {error && (
        <ErrorAlert
          message={error}
          onClose={clearError}
        />
      )}

      <button
        onClick={handleConnect}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {sub ? 'Give consent' : 'Connect New Account'}
      </button>
    </>
  );
}