'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
    showConsent?: boolean;
};

export default function GoogleDrivePicker({
    onError,
    onFileSelected,
    showConsent = false,
}: Props) {
    const { googleAccounts, getValidToken, tokenError } = useGoogle();

    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [isApiReady, setIsApiReady] = useState(false);

    // -----------------------------
    // Load Google Picker API
    // -----------------------------
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

    // -----------------------------
    // Derived accounts
    // -----------------------------
    const accounts = useMemo(() => googleAccounts ?? [], [googleAccounts]);

    const hasExpired = useMemo(
        () => accounts.some(a => a.consentExpired),
        [accounts]
    );

    // -----------------------------
    // Picker launcher (safe + timeout)
    // -----------------------------
    const openPicker = useCallback(
        (accessToken: string, account: GoogleLinkedAccount) => {
            const google = window.google;

            const docsView = new google.picker.DocsView(
                google.picker.ViewId.DOCS
            )
                .setIncludeFolders(true)
                .setSelectFolderEnabled(true)
                .setParent('root');

            let timeout: NodeJS.Timeout;

            const picker = new google.picker.PickerBuilder()
                .addView(docsView)
                .setOAuthToken(accessToken)
                .setDeveloperKey(API_KEY!)
                .setCallback((data: any) => {
                    clearTimeout(timeout);
                    setLoadingId(null);

                    const action = data.action;

                    if (action === google.picker.Action.PICKED) {
                        if (data.docs?.[0]) {
                            onFileSelected?.(data.docs[0], account);
                        } else {
                            onError?.('No file selected.');
                        }
                    }
                })
                .build();

            // 🔴 safety timeout
            timeout = setTimeout(() => {
                setLoadingId(null);
                onError?.('Google Picker timed out.');
            }, 10000);

            picker.setVisible(true);
        },
        [onError, onFileSelected]
    );

    // -----------------------------
    // Open picker with token safety + retry
    // -----------------------------
    const handleOpenPicker = useCallback(
        async (account: GoogleLinkedAccount) => {
            if (!API_KEY) return onError?.('Missing API key');

            if (!window.google?.picker) {
                return onError?.('Google Picker not loaded');
            }

            setLoadingId(account.id);

            try {
                const validAccount = await getValidToken(account);

                if (!validAccount?.accessToken) {
                    throw new Error('Missing access token');
                }

                openPicker(validAccount.accessToken, validAccount);
            } catch (err) {
                // retry once (token refresh edge cases)
                try {
                    const retry = await getValidToken(account);

                    if (!retry?.accessToken) {
                        throw new Error('Token refresh failed');
                    }

                    openPicker(retry.accessToken, retry);
                } catch (finalErr) {
                    setLoadingId(null);
                    onError?.(
                        finalErr instanceof Error
                            ? finalErr.message
                            : 'Failed to open Google Drive'
                    );
                }
            }
        },
        [getValidToken, openPicker, onError]
    );

    // -----------------------------
    // Empty state
    // -----------------------------
    if (!accounts.length) return null;

    // -----------------------------
    // UI (CONSENT MODE = overlay, NOT replacement)
    // -----------------------------
    return (
        <div className="flex flex-col gap-3 mt-4">

            {showConsent && hasExpired && (
                <div className="space-y-2">
                    <p className="text-sm text-yellow-600">
                        Some accounts need re-authorization:
                    </p>
                </div>
            )}

            {accounts.map(acc => {
                const expired = acc.consentExpired;

                return (
                    <div
                        key={acc.id}
                        className={[
                            'flex items-center justify-between border rounded p-2',
                            expired ? 'bg-yellow-50 border-yellow-300' : '',
                        ].join(' ')}
                    >
                        <span className="text-sm text-gray-700">
                            {acc.googleEmail}
                        </span>

                        {/* Expired account */}
                        {expired ? (
                            <button
                                className="px-3 py-1 text-sm bg-yellow-500 text-white rounded"
                                onClick={() => onError?.('Trigger OAuth reconnect here')}
                            >
                                Reconnect
                            </button>
                        ) : (
                            // Valid account → picker
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleOpenPicker(acc)}
                                    disabled={!isApiReady || loadingId === acc.id}
                                    className="px-4 py-1 bg-green-600 text-white rounded disabled:bg-green-400"
                                >
                                    {!isApiReady
                                        ? 'Loading...'
                                        : loadingId === acc.id
                                            ? 'Opening...'
                                            : 'Drive'}
                                </button>

                                {loadingId === acc.id && (
                                    <button
                                        onClick={() => setLoadingId(null)}
                                        className="text-xs text-red-500 underline"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* token refresh errors */}
            {tokenError && (
                <p className="text-sm text-red-500">{tokenError}</p>
            )}
        </div>
    );
}