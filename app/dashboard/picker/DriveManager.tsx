'use client';

import { useState } from 'react';
import { GoogleLinkedAccount } from '@/lib/services/google/GoogleAuthServiceTypes';
import { downloadDriveFileBlob, getDriveFileMetadata } from '@/lib/google-drive-utils';
import GoogleDrivePicker from '@/components/google/ui/GoogleDrivePicker';
import ErrorAlert from '@/components/banners/ErrorAlert';
import FileMetadataDisplay from '@/components/google/ui/FileMetadataDisplay';
import { GoogleDriveFileMetadata, GoogleDriveFile } from '@/types/google';

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

  // New state to store the detailed metadata
  const [fileMetadata, setFileMetadata] = useState<GoogleDriveFileMetadata | null>(null);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

  // 1. & 2. Handle selection and gather metadata
  const handleFileSelected = async (file: GoogleDriveFile, acc: GoogleLinkedAccount) => {
    setSelectedFile(file);
    setSelectedAccount(acc);
    setError(null);
    setFileMetadata(null); // Clear previous metadata

    try {
      setIsFetchingMetadata(true);
      const metadata = await getDriveFileMetadata(file.id, acc.accessToken!);
      setFileMetadata(metadata);
    } catch (err) {
      setError('Failed to fetch file metadata.');
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  // 3. Download Logic
  const handleDownload = async () => {
    if (!selectedFile || !selectedAccount) return;

    try {
      setIsDownloading(true);
      setError(null);

      const blob = await downloadDriveFileBlob(selectedFile.id, selectedAccount.accessToken!);

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
        onFileSelected={handleFileSelected} // Uses the combined handler
      />

      {selectedFile && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Selected File</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Name:</strong> {selectedFile.name}</p>
            <p><strong>Type:</strong> {selectedFile.mimeType}</p>
            <p><strong>File ID:</strong> {selectedFile.id}</p>

            {/* Display metadata if loaded */}
            {isFetchingMetadata ? (
              <p className="text-blue-500 italic">Loading metadata...</p>
            ) : fileMetadata ? (
              <FileMetadataDisplay metadata={fileMetadata} />
            ) : null}
          </div>

          <button
            onClick={handleDownload}
            disabled={isDownloading || isFetchingMetadata}
            className={`mt-6 px-6 py-3 text-white rounded-lg font-medium ${isDownloading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {isDownloading ? 'Downloading...' : '⬇️ Download Actual File'}
          </button>
        </div>
      )}
    </div>
  );
}