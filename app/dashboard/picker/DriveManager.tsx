'use client';

import { useState } from 'react';
import { GoogleLinkedAccount } from '@/lib/services/google/GoogleAuthServiceTypes';
import { downloadDriveFileBlob } from '@/lib/google-drive-utils';
import GoogleDrivePicker from '@/components/auth/google/ui/GoogleDrivePicker';
import ErrorAlert from '@/components/banners/ErrorAlert';

interface SelectedFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
}

export default function DriveManager({ initialAccounts }: { initialAccounts: GoogleLinkedAccount[] }) {
  const [googleAccounts] = useState<GoogleLinkedAccount[]>(initialAccounts);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<GoogleLinkedAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!selectedFile || !selectedAccount) return;

    try {
      setIsDownloading(true);
      setError(null);

      // Fetch the binary content
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
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <GoogleDrivePicker
        googleLinkedAccounts={googleAccounts}
        onError={setError}
        onFileSelected={(file, acc) => {
          setSelectedFile(file as SelectedFile);
          setSelectedAccount(acc);
          setError(null);
        }}
      />

      {selectedFile && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Selected File</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Name:</strong> {selectedFile.name}</p>
            <p><strong>Type:</strong> {selectedFile.mimeType}</p>
            <p><strong>File ID:</strong> {selectedFile.id}</p>
          </div>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`mt-6 px-6 py-3 text-white rounded-lg font-medium ${
              isDownloading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isDownloading ? 'Downloading...' : '⬇️ Download Actual File'}
          </button>
        </div>
      )}
    </div>
  );
}