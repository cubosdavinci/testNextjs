'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useGoogle } from '@/context/GoogleContext';
import ConnectGoogle from '@/components/google/ConnectGoogle';
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
    const { googleAccounts, getValidToken } = useGoogle();

    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [isApiReady, setIsApiReady] = useState(false);
    const pickerRef = useRef<any>(null);
    // -----------------------------
    // Load Picker API
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

    const accounts = useMemo(() => googleAccounts ?? [], [googleAccounts]);

    // -----------------------------
    // Picker
    // -----------------------------
    const openPicker = useCallback(
        (accessToken: string, account: GoogleLinkedAccount) => {
            const google = window.google;

            const docsView = new google.picker.DocsView(google.picker.ViewId.DOCS)
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
                    if (data.action === google.picker.Action.PICKED) {
                        if (data.docs?.[0]) {
                            onFileSelected?.(data.docs[0], account);
                        } else {
                            onError?.('No file selected.');
                        }
                    }

                    // If it closes naturally, clear the ref
                    if (data.action === google.picker.Action.CANCEL) {
                        pickerRef.current = null;
                    }
                })
                .build();
            
            timeout = setTimeout(() => {
                // If the picker is stuck in a loading state after 10 seconds:
                closePicker();
                setLoadingId(null);
                onError?.('Google Picker timed out or failed to initialize.');
            }, 5000);

            // Save to ref
            pickerRef.current = picker;


            picker.setVisible(true);
        },
        []
    );

    const closePicker = () => {
        if (pickerRef.current) {
            pickerRef.current.setVisible(false);
            pickerRef.current = null;
        }
    };

    const handleOpenPicker = useCallback(
        async (account: GoogleLinkedAccount) => {
            if (!API_KEY) return onError?.('Missing API key');

            setLoadingId(account.id);

            try {
                const valid = await getValidToken(account);

                if (!valid?.accessToken) {
                    throw new Error('Missing token');
                }

                openPicker(valid.accessToken, valid);
            } catch (err) {
                setLoadingId(null);
                onError?.(
                    err instanceof Error ? err.message : 'Failed to open Drive'
                );
            }
        },
        [getValidToken, openPicker, onError]
    );

    if (!accounts.length) return null;

    // -----------------------------
    // UI
    // -----------------------------
    return (
        <div className="flex flex-col gap-3 mt-4">

            {showConsent && accounts.some(a => a.consentExpired) && (
                <p className="text-sm text-yellow-600">
                    Some accounts need re-authorization:
                </p>
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

                        {/* -----------------------------
                EXPIRED → REAL CONSENT COMPONENT
            ----------------------------- */}
                        {expired ? (
                            <ConnectGoogle sub={acc.googleEmail} />
                        ) : (
                            /* -----------------------------
                                VALID → PICKER
                            ----------------------------- */
                            <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleOpenPicker(acc)}
                                        disabled={!isApiReady || loadingId === acc.id}
                                        className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded disabled:bg-green-400 flex items-center gap-2"
                                    >
                                        <img
                                            src="/images/ico/google-drive_32.ico"
                                            alt="Google Drive"
                                            className="w-5 h-5 rounded-sm bg-white"
                                        />

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
        </div>
    );
}