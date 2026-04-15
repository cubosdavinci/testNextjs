// components/Card_GoogleAccount.tsx

import type { GoogleLinkedAccount } from '@/lib/services/google/GoogleAuthServiceTypes';
import ConnectGoogle from '../ConnectGoogle'; // adjust path as needed

interface Card_GoogleAccountProps {
    googleAccount: GoogleLinkedAccount;
    removeLinkedAccount: (id: string) => Promise<void>;
    disconnectLinkedAccount: (id: string) => Promise<void>;
}

export default function Card_GoogleAccount({
    googleAccount,
    removeLinkedAccount,
    disconnectLinkedAccount,
}: Card_GoogleAccountProps) {
    const isExpired = googleAccount.consentExpired;

    return (
        <div
            className={`p-4 border rounded-lg relative flex flex-col ${isExpired
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-green-50 border-green-200'
                }`}
        >
            {/* Top-right close (X) button - always visible */}
            <button
                onClick={() => removeLinkedAccount(googleAccount.id)}
                title="Unlink Account from App"
                className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-100 focus:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Remove account"
            >
                ✕
            </button>

            <div className="pr-8"> {/* padding to avoid overlap with X button */}
                <p className="font-medium text-gray-900">{googleAccount.googleEmail}</p>

                {isExpired ? (
                    <p className="text-sm text-orange-600 mt-1">
                        Consent expired — (reconnect anytime).
                    </p>
                ) : (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                        Connected successfully <span className="text-base">✓</span>
                    </p>
                )}
            </div>

            {/* Action button area */}
            <div className="mt-4">
                {isExpired ? (
                    <ConnectGoogle
                        sub={googleAccount.id}   // pass id for reconnect
                    />
                ) : (
                    <button
                        onClick={() => disconnectLinkedAccount(googleAccount.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Disconnect
                    </button>
                )}
            </div>
        </div>
    );
}