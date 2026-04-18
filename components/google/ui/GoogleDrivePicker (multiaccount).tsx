'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGoogle } from '@/context/GoogleContext';
import { GoogleLinkedAccount } from '@/lib/services/google/GoogleAuthServiceTypes';

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
    onError?: (message: string) => void;
    onFileSelected?: (file: GoogleDriveFile, account: GoogleLinkedAccount) => void;
};

export default function GoogleDrivePicker({
    onError,
    onFileSelected,
}: Props) {
    const { googleAccounts, getValidToken, tokenError } = useGoogle();

    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [isApiReady, setIsApiReady] = useState(false);

    // Load Google API
    useEffect(() => {
        const checkApi = () => {
            if (window.gapi && window.google?.picker) {
                setIsApiReady(true);
            }
        };

        if (!window.gapi) {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => window.gapi.load('picker', checkApi);
            document.body.appendChild(script);
        } else {
            checkApi();
        }
    }, []);

    const openPicker = useCallback((
        accessToken: string,
        account: GoogleLinkedAccount
    ) => {
        const google = window.google;

        if (!google?.picker) return onError?.('Google Picker API not loaded.')
        
        const docsView = new google.picker.DocsView(google.picker.ViewId.DOCS)
            .setIncludeFolders(true)
            .setSelectFolderEnabled(true)
            .setParent('root');

        let timeout: NodeJS.Timeout;

        const picker = new google.picker.PickerBuilder()
            .addView(docsView)
            .setOAuthToken(accessToken)
            .setDeveloperKey(API_KEY!)
            .setCallback((data: { action: string; docs?: any[] }) => {
                clearTimeout(timeout);

                const action = data.action;

                if (action === google.picker.Action.PICKED) {
                    if (data.docs?.[0]) {
                        onFileSelected?.(data.docs[0], account);
                    } else {
                        onError?.('No file selected.');
                    }
                } else if (action === google.picker.Action.CANCEL) {
                    onError?.('Picker closed.');
                } else {
                    onError?.('Unexpected Google Picker response.');
                }

                setLoadingId(null);
            })
            .build();

        // 🔴 Timeout fallback (critical)
        timeout = setTimeout(() => {
            setLoadingId(null);
            onError?.('Google Picker did not respond. Possible auth issue.');
        }, 10000);

        picker.setVisible(true);
    }, [onError, onFileSelected]);

    const handleOpenPicker = useCallback(async (account: GoogleLinkedAccount) => {
        if (!API_KEY) return onError?.('Missing API key.');

        const google = window.google;
        if (!google?.picker) {
            return onError?.('Google Picker API not loaded.');
        }

        setLoadingId(account.id);

        try {
            // ✅ Step 1: Always get valid token (auto refresh if needed)
            const validAccount = await getValidToken(account);

            if (!validAccount?.accessToken) {
                throw new Error('Missing access token.');
            }

            openPicker(validAccount.accessToken, validAccount);

        } catch (err) {
            console.warn('First attempt failed, retrying...', err);

            // 🔁 Step 2: Retry ONCE (important for flaky tokens)
            try {
                const refreshed = await getValidToken(account);

                if (!refreshed?.accessToken) {
                    throw new Error('Token refresh failed.');
                }

                openPicker(refreshed.accessToken, refreshed);

            } catch (retryErr) {
                setLoadingId(null);
                onError?.(
                    retryErr instanceof Error
                        ? retryErr.message
                        : 'Failed to authenticate with Google.'
                );
            }
        }
    }, [getValidToken, openPicker, onError]);

    if (!googleAccounts?.length) return null;

    return (
        <div className="flex flex-col gap-2 mt-4">
            {googleAccounts.map((account) => (
                <div key={account.id} className="flex flex-col gap-1">
                    <button
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

                    {/* 🧯 Manual escape hatch */}
                    {loadingId === account.id && (
                        <button
                            onClick={() => setLoadingId(null)}
                            className="text-xs text-red-500 underline"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            ))}

            {/* Optional token error surface */}
            {tokenError && (
                <p className="text-sm text-red-500">
                    {tokenError}
                </p>
            )}
        </div>
    );
}