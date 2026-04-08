'use client';

export default function ConnectGoogle() {
  const handleConnect = () => {
    if (!window.google?.accounts?.oauth2) {
      console.error('Google SDK not loaded');
      return;
    }

    const client = window.google.accounts.oauth2.initCodeClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.file email profile',
      ux_mode: 'popup',        // try popup first
      access_type: 'offline',   // important for refresh token
      prompt: 'consent',        // always ask consent
      callback: async (response) => {
        if (response.code) {
          try {
            await fetch('/api/auth/google/callback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: response.code }),
            });
            //window.location.reload();
          } catch (err) {
            console.error('Error sending code to server', err);
          }
        } else {
          console.error('No code received from Google');
        }
      },
    });

    // Try popup first
    try {
      client.requestCode();
    } catch (err) {
      console.warn('Popup blocked, falling back to redirect', err);
      // fallback to redirect
      const redirectClient = window.google.accounts.oauth2.initCodeClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file email profile',
        ux_mode: 'redirect',   // redirect fallback
        access_type: 'offline',
        prompt: 'consent',
        callback: () => {
          // callback is required but won't be called in redirect mode
        },
      });
      redirectClient.requestCode();
    }
  };

  return (
    <button
      onClick={handleConnect}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Connect Google Drive
    </button>
  );
}