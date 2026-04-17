'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GoogleDrivePicker from '@/components/google/ui/GoogleDrivePicker';
import ErrorAlert from '@/components/banners/ErrorAlert';
import FileMetadataDisplay from '@/components/google/ui/FileMetadataDisplay';

import {
  downloadDriveFileBlob,
  getDriveFileMetadata,
} from '@/lib/google-drive-utils';

import {
  GoogleLinkedAccount,
} from '@/lib/services/google/GoogleAuthServiceTypes';

import { GoogleDriveFile, GoogleDriveFileMetadata } from '@/types/google';

export interface SelectedDriveFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
  metadata?: GoogleDriveFileMetadata | null;
  accountId?: string;
}

interface CardGoogleDriveFileProps {
  title?: string;
  accounts: GoogleLinkedAccount[];
  value?: SelectedDriveFile[];
  onChange?: (files: SelectedDriveFile[]) => void;
}

export default function CardGoogleDriveFile({
  title = 'Google Drive Files',
  accounts,
  value = [],
  onChange,
}: CardGoogleDriveFileProps) {
  const [files, setFiles] = useState<SelectedDriveFile[]>(value);
  const [error, setError] = useState<string | null>(null);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  // sync upward
  useEffect(() => {
    onChange?.(files);
  }, [files, onChange]);

  const addFile = async (file: GoogleDriveFile, acc: GoogleLinkedAccount) => {
    try {
      setError(null);
      setLoadingFileId(file.id);

      // avoid duplicates
      if (files.some((f) => f.id === file.id)) return;

      const metadata = await getDriveFileMetadata(file.id, acc.accessToken!);

      const newFile: SelectedDriveFile = {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        metadata,
        accountId: acc.id,
      };

      setFiles((prev) => [...prev, newFile]);
    } catch (err) {
      setError('Failed to add file');
    } finally {
      setLoadingFileId(null);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <section>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

          {/* Picker */}
          <GoogleDrivePicker
            googleLinkedAccounts={accounts}
            onError={setError}
            onFileSelected={addFile}
          />

          {/* File list */}
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="border rounded-lg p-3 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.mimeType}</p>
                  </div>

                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>

                {loadingFileId === file.id && (
                  <p className="text-sm text-blue-500">Loading metadata...</p>
                )}

                {file.metadata && (
                  <FileMetadataDisplay metadata={file.metadata} />
                )}
              </div>
            ))}
          </div>

        </CardContent>
      </Card>
    </section>
  );
}