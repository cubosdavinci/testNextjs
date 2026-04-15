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
      ux_mode: 'popup',
      access_type: 'offline',   // ✅ important
      prompt: 'consent',        // ✅ important
      callback: async (response) => {
        if (response.code) {
          await fetch('/api/auth/google/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: response.code }),
          });

          window.location.reload();
        }
      },
    });

    client.requestCode();
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