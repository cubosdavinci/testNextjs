'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GoogleDrivePicker from '@/components/google/ui/GoogleDrivePicker';
import ErrorAlert from '@/components/banners/ErrorAlert';
import FileMetadataDisplay from '@/components/google/ui/FileMetadataDisplay';

import { useSession } from '@/components/auth/useSession';
import {
  getDriveFileMetadata,
  downloadDriveFileBlob,
} from '@/lib/google-drive-utils';

import type { GoogleLinkedAccount } from '@/lib/services/google/GoogleAuthServiceTypes';

export interface SelectedDriveFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
  accountId?: string;
  metadata?: any;
}

interface Props {
  title?: string;
  value?: SelectedDriveFile[];
  onChange?: (files: SelectedDriveFile[]) => void;

  /**
   * If true → store RAW Google Drive API response
   * If false → store minimal subset
   */
  metadataJson?: boolean;
}

export default function CardGoogleDriveFile({
  title = 'Google Drive Files',
  value = [],
  onChange,
  metadataJson = false,
}: Props) {

  const { user, sessionLoading } = useSession();

  const [accounts, setAccounts] = useState<GoogleLinkedAccount[]>([]);
  const [files, setFiles] = useState<SelectedDriveFile[]>(value);

  const [error, setError] = useState<string | null>(null);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  useEffect(() => {
    onChange?.(files);
  }, [files, onChange]);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user?.id) return;

      try {
        setLoadingAccounts(true);

        const res = await fetch(
          `/api/auth/google/get-linked-accounts?user_id=${user.id}`
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.error || 'Failed to load accounts');
        }

        setAccounts(json.data.google_linked_accounts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoadingAccounts(false);
      }
    };

    if (!sessionLoading) fetchAccounts();
  }, [user?.id, sessionLoading]);

  // ADD FILE
  const addFile = async (file: any, acc: GoogleLinkedAccount) => {
    try {
      setError(null);
      setLoadingFileId(file.id);

      if (files.some(f => f.id === file.id)) return;

      const metadata = await getDriveFileMetadata(
        file.id,
        acc.accessToken!
      );

      const selectedFile: SelectedDriveFile = {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        accountId: acc.id,

        metadata: metadataJson
          ? metadata // ✅ RAW GOOGLE RESPONSE (UNCHANGED)
          : metadata, // still raw here (no transformation anymore)
      };

      setFiles(prev => [...prev, selectedFile]);

    } catch {
      setError('Failed to add file');
    } finally {
      setLoadingFileId(null);
    }
  };

  // REMOVE FILE
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // DOWNLOAD FILE
  const handleDownload = async (file: SelectedDriveFile) => {
    try {
      setError(null);

      const acc = accounts.find(a => a.id === file.accountId);
      if (!acc?.accessToken) {
        throw new Error('Missing Google account token');
      }

      const blob = await downloadDriveFileBlob(
        file.id,
        acc.accessToken
      );

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  if (sessionLoading) {
    return <div className="p-4">Loading session...</div>;
  }

  if (!user) {
    return <div className="p-4">Please log in to use Google Drive.</div>;
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {error && (
          <ErrorAlert message={error} onClose={() => setError(null)} />
        )}

        {loadingAccounts && (
          <p className="text-sm text-gray-500">
            Loading Google accounts...
          </p>
        )}

        <GoogleDrivePicker
          googleLinkedAccounts={accounts}
          onError={setError}
          onFileSelected={addFile}
        />

        <div className="space-y-3">

          {files.map(file => (
            <div
              key={file.id}
              className="border rounded-lg p-3 space-y-2 relative"
            >

              <div className="flex justify-between items-start">
                <div className="pr-10">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {file.mimeType}
                  </p>
                </div>

                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(file)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Download
                </button>
              </div>

              {loadingFileId === file.id && (
                <p className="text-blue-500 text-sm">
                  Loading metadata...
                </p>
              )}

              {file.metadata && (
                <FileMetadataDisplay metadata={file.metadata} />
              )}

            </div>
          ))}

        </div>

      </CardContent>
    </Card>
  );
}