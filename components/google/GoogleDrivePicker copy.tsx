'use client';

import { useEffect, useState } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import { GoogleLinkedAccount } from '@/lib/services/google/GoogleAuthServiceTypes';

type Props = {
    googleLinkedAccounts: GoogleLinkedAccount[] | null;
};

export default function GoogleDrivePicker({ googleLinkedAccounts }: Props) {
    const [openPicker] = useDrivePicker();
    const [accounts, setAccounts] = useState<GoogleLinkedAccount[]>([]);

    // Sync internal state whenever prop changes
    useEffect(() => {
        if (googleLinkedAccounts && googleLinkedAccounts.length > 0) {
            setAccounts(googleLinkedAccounts);
        } else {
            setAccounts([]); // remove buttons if empty/null
        }
    }, [googleLinkedAccounts]);

    const handleOpenPicker = (accessToken: string) => {
        openPicker({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
            token: accessToken,
            viewId: 'DOCS',
            showUploadView: true,
            showUploadFolders: true,
            supportDrives: true,
            multiselect: false,
            callbackFunction: (data) => {
                console.log('Picker data:', data);
            },
        });
    };

    if (accounts.length === 0) {
        return null; // removes rendered buttons
    }

    return (
        <div className="flex flex-col gap-2 mt-4">
            {accounts.map((account) => {
                const emailPrefix = account.googleEmail.split('@')[0];

                return (
                    <button
                        key={account.id}
                        onClick={() => handleOpenPicker(account.accessToken)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        disabled={!account.accessToken}
                    >
                        Drive ({emailPrefix})
                    </button>
                );
            })}
        </div>
    );
}