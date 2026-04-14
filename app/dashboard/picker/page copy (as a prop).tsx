'use client';

import useDrivePicker from 'react-google-drive-picker';
import ErrorAlert from "@/components/banners/ErrorAlert";
import { useState } from 'react';

export default function DriveTestPage({ googleToken }: { googleToken: string | null }) {
  const [openPicker] = useDrivePicker();
  const [error, setError] = useState<string | null>(null);
  const handleOpenPicker = () => {
    if (!googleToken) return;

    openPicker({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
      viewId: "DOCS",
      token: googleToken,
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      callbackFunction: (data) => {
        if (data.action === 'picked') {
          console.log('Selected files:', data.docs);
          // TODO: Handle selected files (send to your backend, etc.)
        }
      },
    });
  };

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-8">Google Drive Integration</h1>
      {error && <ErrorAlert message={error} />}
      {googleToken ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-green-600">
            <div className="w-4 h-4 bg-green-600 rounded-full"></div>
            <span className="font-medium">Connected to Google Drive</span>
          </div>

          <button
            onClick={handleOpenPicker}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition"
          >
            Open Google Picker
          </button>

          <p className="text-sm text-gray-500 text-center">
            You can now select files from your Google Drive
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-lg mb-2">Connect your Google account</p>
            <p className="text-gray-600">
              To access and upload files from Google Drive, please connect your account first.
            </p>
          </div>

          <ConnectGoogle />
        </div>
      )}
    </div>
  );
}

// ConnectGoogle Component
function ConnectGoogle() {
  const handleConnect = () => {
    if (!window.google?.accounts?.oauth2) {
      console.error('Google Identity Services SDK not loaded');
      alert('Google SDK is not loaded. Please make sure the script is included in your layout.');
      return;
    }

    const client = window.google.accounts.oauth2.initCodeClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly email profile',
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

            if (res.ok) {
              window.location.reload(); // Refresh to get the new googleToken
            } else {
              console.error('Server error:', await res.text());
              alert('Failed to connect Google account');
            }
          } catch (err) {
            console.error('Error sending authorization code', err);
            alert('Connection failed. Please try again.');
          }
        } else if (response.error) {
          console.error('Google OAuth error:', response.error);
        }
      },
    });

    try {
      client.requestCode();
    } catch (err) {
      console.warn('Popup blocked, falling back to redirect...', err);

      // Fallback to redirect mode
      const redirectClient = window.google.accounts.oauth2.initCodeClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly email profile',
        ux_mode: 'redirect',
        access_type: 'offline',
        prompt: 'consent',
      });
      redirectClient.requestCode();
    }
  };

  return (
    <button
      onClick={handleConnect}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition"
    >
      Connect Google Drive
    </button>
  );
}