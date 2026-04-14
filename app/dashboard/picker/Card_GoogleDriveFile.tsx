'use client';

import { useState } from 'react';
import { useGoogle } from '@/context/GoogleContext';

import ErrorAlert from '@/components/banners/ErrorAlert';
import GoogleDrivePicker from '@/components/auth/google/GoogleDrivePicker';
import GetValidTokenStatus from '@/components/auth/google/GetValidTokenStatus';

import { downloadDriveFileBlob } from '@/lib/google-drive-utils';
import type { GoogleLinkedAccount } from '@/lib/services/google/GoogleAuthServiceTypes';

interface SelectedFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
}

export default function Card_GoogleDriveFile() {
  const {
    googleAccounts,
    isLoading,
    error: contextError,
    clearError,
    getValidToken,
    refreshAccounts,
    isRefreshingToken,
    tokenError,
  } = useGoogle();

  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<GoogleLinkedAccount | null>(null);

  const handleFileSelected = (file: SelectedFile, account: GoogleLinkedAccount) => {
    setSelectedFile(file);
    setSelectedAccount(account);
  };

  const handleDownload = async () => {
    if (!selectedFile || !selectedAccount) return;

    try {
      setLocalError(null);

      const updatedAccount = await getValidToken(selectedAccount);

      setSelectedAccount(updatedAccount);

      // ✅ Optional: resync everything after token refresh
      await refreshAccounts();

        if (!updatedAccount.accessToken) {
            throw new Error('Missing access token');
        }

        const blob = await downloadDriveFileBlob(
            selectedFile.id,
            updatedAccount.accessToken
        );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.name;
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  // 🔥 Loading state
  if (isLoading) {
    return <div>Loading Google accounts...</div>;
  }

  // 🔥 Context error
  if (contextError) {
    return <ErrorAlert message={contextError} onClose={clearError} />;
  }

  // 🔥 Local error
  if (localError) {
    return <ErrorAlert message={localError} onClose={() => setLocalError(null)} />;
  }

  if (!googleAccounts || googleAccounts.length === 0) {
    return <div>No Google accounts connected.</div>;
  }

  return (
    <div className="space-y-8">

      {/* ✅ FILTERED BUTTONS */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Drive Access</h2>

        {googleAccounts
          .filter(acc => !acc.consentExpired)
          .map(acc => (
            <button
              key={acc.id}
              className="px-4 py-2 bg-blue-600 text-white rounded mr-2"
            >
              Drive ({acc.googleEmail.split('@')[0]})
            </button>
          ))}
      </div>

      {/* Picker */}
      <GoogleDrivePicker
        googleLinkedAccounts={googleAccounts}
        onError={setLocalError}
        onFileSelected={handleFileSelected}
      />

      {/* Selected file */}
      {selectedFile && (
        <div className="border p-4 rounded">
          <p>{selectedFile.name}</p>

          <button
            onClick={handleDownload}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
          >
            Download
          </button>

          <GetValidTokenStatus
            isRefreshing={isRefreshingToken}
            error={tokenError}
          />
        </div>
      )}
    </div>
  );
}