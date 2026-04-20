// components/products/create/CardGoogleDriveFile.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GoogleDrivePicker from '@/components/google/ui/GoogleDrivePicker';
import ErrorAlert from '@/components/banners/ErrorAlert';
import FileMetadataDisplay from '@/components/google/ui/FileMetadataDisplay';

import { useGoogle } from '@/context/GoogleContext';

import {
  getDriveFileMetadata,
  downloadDriveFileBlob,
} from '@/lib/google-drive-utils';

import type { GoogleLinkedAccount } from '@/lib/services/google/GoogleAuthServiceTypes';
import type { RPCProductFileInsert } from '@/lib/supabase/types';





export interface SelectedDriveFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
  linkedAccount?: string;
  metadata?: any;
}





interface Props {
  title?: string;
  value?: SelectedDriveFile[];
  onChange?: (files: SelectedDriveFile[]) => void;
  metadataJson?: boolean;
}

export default function CardGoogleDriveFile({
  title = 'Google Drive Files',
  value = [],
  onChange,
  metadataJson = false,
}: Props) {

  const {
    googleAccounts,
    isLoading,
    error: googleError,
    clearError,
    getValidToken,
  } = useGoogle();

  const [files, setFiles] = useState<SelectedDriveFile[]>(value);
  const [error, setError] = useState<string | null>(null);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  // sync to parent
  useEffect(() => {
    onChange?.(files);
  }, [files, onChange]);

  // merge google context errors
  useEffect(() => {
    if (googleError) setError(googleError);
  }, [googleError]);

  // ADD FILE
  const addFile = async (file: any, linkedAccount: GoogleLinkedAccount) => {
    try {
      setError(null);
      setLoadingFileId(file.id);

      if (files.some(f => f.id === file.id)) return;

      const validAccount = await getValidToken(linkedAccount);

      const metadata = await getDriveFileMetadata(
        file.id,
        validAccount.accessToken!
      );

      const selectedFile: SelectedDriveFile = {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        linkedAccount: linkedAccount.id,
        metadata: metadataJson ? metadata : metadata,
      };

      setFiles(prev => [...prev, selectedFile]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add file');
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

      const linkedAccount = googleAccounts?.find(a => a.id === file.linkedAccount);
      if (!linkedAccount) throw new Error('Account not found');

      const validAccount = await getValidToken(linkedAccount);

      const blob = await downloadDriveFileBlob(
        file.id,
        validAccount.accessToken!
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

  if (isLoading) {
    return <div className="p-4">Loading Google accounts...</div>;
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {error && (
          <ErrorAlert
            message={error}
            onClose={() => {
              setError(null);
              clearError();
            }}
          />
        )}

        {/* ✅ SINGLE RESPONSIBILITY PICKER */}
        {!!googleAccounts?.length && (
          <GoogleDrivePicker

            onError={setError}
            onFileSelected={addFile}
          />
        )}

        {/* FILE LIST */}
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