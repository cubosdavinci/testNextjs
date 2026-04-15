 'use client';

import { useGoogle } from '@/context/GoogleContext';
import ErrorAlert from '@/components/banners/ErrorAlert';

export default function ConnectGoogle() {
  const { canConnect, connectWithCode, error } = useGoogle();

  const handleConnect = () => {
    const client = window?.google?.accounts.oauth2.initCodeClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      scope: 'openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly',
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
        onClose={() => {/* or clearError from context */}}
      />
    )}

    <button onClick={handleConnect}>
      Connect Google Drive
    </button>
  </>
);
}
