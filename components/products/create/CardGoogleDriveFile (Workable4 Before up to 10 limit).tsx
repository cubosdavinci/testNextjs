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
import type { ProductFileCreateInput } from '@/lib/supabase/types';
import { STORAGE_PROVIDER } from '@/types/db/product-files/StorageProvider';
import { Json } from '@/types/supabase';

interface Props {
  title?: string;
  value?: ProductFileCreateInput[];
  onChange?: (files: ProductFileCreateInput[]) => void;
  metadataJson?: boolean;
}

export default function CardGoogleDriveFile({
  title = 'Google Drive Files',
  value = [],
  onChange,
}: Props) {
  const {
    googleAccounts,
    isLoading,
    error: googleError,
    clearError,
    getValidToken,
  } = useGoogle();

  const [productFiles, setProductFiles] = useState<ProductFileCreateInput[]>(value);
  const [error, setError] = useState<string | null>(null);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  // Sync DOWN
  useEffect(() => {
    setProductFiles(value);
  }, [value]);

  // Sync UP
  useEffect(() => {
    onChange?.(productFiles);
  }, [productFiles, onChange]);

  // Google errors
  useEffect(() => {
    if (googleError) setError(googleError);
  }, [googleError]);

  // ADD FILE (FIXED: atomic + race-safe duplicate prevention)
  const addFile = async (file: any, linkedAccount: GoogleLinkedAccount) => {
    try {
      setError(null);

      const validAccount = await getValidToken(linkedAccount);

      const metadata = await getDriveFileMetadata(
        file.id,
        validAccount.accessToken!
      );

      const newFile: ProductFileCreateInput = {
        file_id: file.id,
        file_name: file.name,
        file_type: file.mimeType,
        file_size: metadata?.size ? Number(metadata.size) : 0,
        linked_account_id: linkedAccount.id,
        provider: STORAGE_PROVIDER.GoogleDrive,
        file_checksum: metadata?.md5Checksum ?? 'not available',
        provider_metadata: metadata as Json,
        provider_user_name:
          metadata?.owners?.[0]?.displayName || null,
      };

      setProductFiles(prev => {
        // ✅ atomic duplicate check (prevents race conditions)
        if (prev.some(f => f.file_id === file.id)) {
          setError(`This file (${file.name}) is already included`);
          return prev;
        }

        return [...prev, newFile];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add file');
    } finally {
      setLoadingFileId(null);
    }
  };

  // REMOVE FILE
  const removeFile = (id: string) => {
    setProductFiles(prev => prev.filter(f => f.file_id !== id));
  };

  // DOWNLOAD FILE
  const handleDownload = async (file: ProductFileCreateInput) => {
    try {
      setError(null);

      const linkedAccount = googleAccounts?.find(
        a => a.id === file.linked_account_id
      );
      if (!linkedAccount) throw new Error('Account not found');

      const validAccount = await getValidToken(linkedAccount);

      const blob = await downloadDriveFileBlob(
        file.file_id,
        validAccount.accessToken!
      );

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
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

        {!!googleAccounts?.length && (
          <GoogleDrivePicker
            onError={setError}
            onFileSelected={addFile}
          />
        )}

        <div className="space-y-3">
          {productFiles.map(file => (
            <div
              key={file.file_id}
              className="border rounded-lg p-3 space-y-2 relative"
            >
              <div className="flex justify-between items-start">
                <div className="pr-10">
                  <p className="font-medium">{file.file_name}</p>
                  <p className="text-xs text-gray-500">
                    {file.file_type}
                  </p>
                </div>

                <button
                  onClick={() => removeFile(file.file_id)}
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

              {loadingFileId === file.file_id && (
                <p className="text-blue-500 text-sm">
                  Loading metadata...
                </p>
              )}

              {file.provider_metadata && (
                <FileMetadataDisplay metadata={file.provider_metadata} />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}