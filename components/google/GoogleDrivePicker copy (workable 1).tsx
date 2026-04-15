'use client';

import { useState, useCallback } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import { GoogleLinkedAccount } from '@/lib/services/google/GoogleAuthServiceTypes';
import { validateGoogleToken } from '@/lib/google-drive-utils';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_BROWSER_KEY;

interface GoogleDriveFile {
    id: string;
    name: string;
    mimeType: string;
    sizeBytes?: number;
    url?: string;        // this is only view link
    embedUrl?: string;
    [key: string]: unknown;
}

type Props = {
    googleLinkedAccounts: GoogleLinkedAccount[] | null;
    onError?: (message: string) => void;
    /** Pass the selected file metadata so parent can download it */
    onFileSelected?: (file: GoogleDriveFile, account: GoogleLinkedAccount) => void;
};

export default function GoogleDrivePicker({
    googleLinkedAccounts,
    onError,
    onFileSelected,
}: Props) {
    const [openPicker] = useDrivePicker();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleOpenPicker = useCallback(
        async (account: GoogleLinkedAccount) => {
            if (!CLIENT_ID || !API_KEY) {
                return onError?.('Missing Google configuration.');
            }

            setLoadingId(account.id);

            const isValid = await validateGoogleToken(account.accessToken!);
            if (!isValid) {
                setLoadingId(null);
                return onError?.(`Session expired for ${account.googleEmail.split('@')[0]}`);
            }

            openPicker({
                clientId: CLIENT_ID,
                developerKey: API_KEY,
                token: account.accessToken!,
                viewId: 'DOCS',
                showUploadView: true,
                supportDrives: true,
                multiselect: false,

                callbackFunction: (data: any) => {
                    setLoadingId(null);

                    if (data?.action === 'picked' && data.docs?.[0]) {
                        const file = data.docs[0] as GoogleDriveFile;
                        console.log('Selected file metadata:', file);

                        // Pass both file metadata + the linked account (so we have the token)
                        onFileSelected?.(file, account);
                    }
                    else if (data?.action === 'cancel') {
                        console.log('Picker cancelled');
                    }
                    else if (data?.action === 'error') {
                        onError?.('Google Picker error occurred.');
                    }
                },
            });
        },
        [openPicker, onError, onFileSelected]
    );

    if (!googleLinkedAccounts?.length) return null;

    return (
        <div className="flex flex-col gap-2 mt-4">
            {googleLinkedAccounts.map((account) => (
                <button
                    key={account.id}
                    onClick={() => handleOpenPicker(account)}
                    disabled={!!loadingId}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-400"
                >
                    {loadingId === account.id ? 'Opening...' : `Drive (${account.googleEmail.split('@')[0]})`}
                </button>
            ))}
        </div>
    );
}