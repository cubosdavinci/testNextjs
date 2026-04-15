'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/clients/supabaseBrowser';
import { browserConsoleLog } from '@/lib/utils';

import ErrorAlert from '@/components/banners/ErrorAlert';
import ConnectGoogle from '@/components/google/ConnectGoogle';
import GoogleDrivePicker from './GoogleDrivePicker';

import { GoogleLinkedAccount } from '@/lib/services/google/GoogleAuthServiceTypes';
import { downloadDriveFileBlob, fetchDriveFileContent } from '@/lib/google-drive-utils';

interface SelectedFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
}

export default function DriveTestPage() {
  const [googleAccounts, setGoogleAccounts] = useState<GoogleLinkedAccount[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<GoogleLinkedAccount | null>(null);

  const handleCloseError = () => setError(null);

  // Fetch linked Google accounts
  useEffect(() => {
    const fetchLinkedAccounts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = supabaseBrowser();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user found.');

        const res = await fetch(`/api/auth/google/get-linked-accounts?user_id=${user.id}`);
        const result = await res.json();

        if (result.error) throw new Error(result.error);

        setGoogleAccounts(result.data?.google_linked_accounts ?? null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load Google accounts.';
        console.error(err);
        browserConsoleLog('Fetch Error', err);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkedAccounts();
  }, []);

  // Handle file selection from picker
  const handleFileSelected = (file: SelectedFile, account: GoogleLinkedAccount) => {
    setSelectedFile(file);
    setSelectedAccount(account);
  };

  // Download using your fetchDriveFileContent function
  const handleDownload = async () => {
    if (!selectedFile || !selectedAccount) return;

    try {
      setError(null);

      // Use the new binary-safe function
      const blob = await downloadDriveFileBlob(selectedFile.id, selectedAccount.accessToken!);

      // Trigger browser download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading your Google connections...</div>;
  }

  if (error) {
    return <ErrorAlert message={error} onClose={handleCloseError} />;
  }

  const hasAccounts = googleAccounts && googleAccounts.length > 0;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Google Drive Test</h1>

      {hasAccounts ? (
        <div className="space-y-10">
          {/* Connected Accounts */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Connected Google Accounts</h2>
            {googleAccounts.map((account) => (
              <div key={account.id} className="bg-gray-50 p-4 rounded-lg border mb-4">
                <p className="text-green-700">
                  ✅ Connected: <strong>{account.googleEmail}</strong>
                </p>
                {account.consentExpired && (
                  <p className="text-orange-600 text-sm mt-1">
                    ⚠️ Consent expired — please reconnect
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* File Picker */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Pick a File from Google Drive</h2>
            <GoogleDrivePicker
              googleLinkedAccounts={googleAccounts}
              onError={setError}
              onFileSelected={handleFileSelected}
            />
          </div>

          {/* Selected File + Download Button */}
          {selectedFile && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Selected File</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {selectedFile.name}</p>
                <p><strong>Type:</strong> {selectedFile.mimeType}</p>
                <p><strong>Size:</strong> {selectedFile.sizeBytes ? (selectedFile.sizeBytes / (1024 * 1024)).toFixed(2) + ' MB' : 'Unknown'}</p>
                <p><strong>File ID:</strong> {selectedFile.id}</p>
              </div>

              <button
                onClick={handleDownload}
                className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                ⬇️ Download Actual File
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">No Google Account Connected</h2>
          <ConnectGoogle />
        </div>
      )}
    </div>
  );
}