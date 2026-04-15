'use client';

import { useState, useCallback, useMemo } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import { GoogleLinkedAccount } from '@/lib/services/google/GoogleAuthServiceTypes';
import { validateGoogleToken } from '@/lib/google-drive-utils';
import { useGoogle } from '@/context/GoogleContext';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_BROWSER_KEY;

interface GoogleDriveFile {
    id: string;
    name: string;
    mimeType: string;
    sizeBytes?: number;
    url?: string;
    embedUrl?: string;
    [key: string]: unknown;
}

export default function GoogleDrivePicker() {
    const [openPicker] = useDrivePicker();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const {
        googleAccounts,
    } = useGoogle();

    const validAccounts = useMemo(
        () => googleAccounts?.filter(acc => acc.consentExpired === false) ?? [],
        [googleAccounts]
    );

    const openConnectPopup = () => {
        window.open(
            '/dashboard/settings/google',
            'google-connect',
            'width=600,height=700,left=200,top=100'
        );
    };

    const handleOpenPicker = useCallback(
        async (account: GoogleLinkedAccount) => {
            if (!CLIENT_ID || !API_KEY) {
                console.error('Missing Google configuration.');
                return;
            }

            setLoadingId(account.id);

            const isValid = await validateGoogleToken(account.accessToken!);
            if (!isValid) {
                setLoadingId(null);
                console.error(`Session expired for ${account.googleEmail}`);
                return;
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
                        console.log('Selected file:', file);
                    }

                    if (data?.action === 'error') {
                        console.error('Google Picker error occurred.');
                    }
                },
            });
        },
        [openPicker]
    );

    // CASE 1: no valid accounts
    if (validAccounts.length === 0) {
        return (
            <div className="mt-4">
                <button
                    onClick={openConnectPopup}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                >
                    Connect Google Account
                </button>
            </div>
        );
    }

    // CASE 2: show drive buttons
    return (
        <div className="flex flex-col gap-2 mt-4">
            {validAccounts.map((account) => (
                <button
                    key={account.id}
                    onClick={() => handleOpenPicker(account)}
                    disabled={!!loadingId}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-400"
                >
                    {loadingId === account.id
                        ? 'Opening...'
                        : `Drive (${account.googleEmail.split('@')[0]})`}
                </button>
            ))}
        </div>
    );
}