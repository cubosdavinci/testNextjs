'use client';

import { useState, useEffect, useCallback } from 'react';
import { GoogleLinkedAccount } from '@/lib/services/google/GoogleAuthServiceTypes';

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

type Props = {
    googleLinkedAccounts: GoogleLinkedAccount[] | null;
    onError?: (message: string) => void;
    onFileSelected?: (file: GoogleDriveFile, account: GoogleLinkedAccount) => void;
};

export default function GoogleDrivePicker({
    googleLinkedAccounts,
    onError,
    onFileSelected,
}: Props) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [isApiReady, setIsApiReady] = useState(false);

    useEffect(() => {
        const checkApi = () => {
            if ((window as any).gapi && (window as any).google?.picker) {
                setIsApiReady(true);
            }
        };

        if (!(window as any).gapi) {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => (window as any).gapi.load('picker', checkApi);
            document.body.appendChild(script);
        } else {
            checkApi();
        }
    }, []);

    const handleOpenPicker = useCallback(async (account: GoogleLinkedAccount) => {
        if (!CLIENT_ID || !API_KEY) return onError?.('Missing configuration.');

        const google = (window as any).google;
        if (!google || !google.picker) {
            return onError?.('Google Picker API not loaded.');
        }

        setLoadingId(account.id);

        const docsView = new google.picker.DocsView(google.picker.ViewId.DOCS)
            .setIncludeFolders(true)
            .setSelectFolderEnabled(true);

        const picker = new google.picker.PickerBuilder()
            .addView(docsView)
            .setOAuthToken(account.accessToken)
            .setDeveloperKey(API_KEY)
            .setCallback((data: any) => {
                if (data.action === google.picker.Action.PICKED) {
                    onFileSelected?.(data.docs[0], account);
                }
                setLoadingId(null);
            })
            .build();

        picker.setVisible(true);
    }, [onError, onFileSelected]);

    if (!googleLinkedAccounts?.length) return null;

    return (
        <div className="flex flex-col gap-2 mt-4">
            {googleLinkedAccounts.map((account) => (
                <button
                    key={account.id}
                    onClick={() => handleOpenPicker(account)}
                    disabled={!isApiReady || loadingId === account.id}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-400"
                >
                    {!isApiReady
                        ? 'Loading API...'
                        : loadingId === account.id
                            ? 'Opening...'
                            : `Drive (${account.googleEmail.split('@')[0]})`}
                </button>
            ))}
        </div>
    );
}