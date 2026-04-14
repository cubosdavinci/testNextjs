import React from 'react';

interface Props {
    isRefreshing: boolean;
    error: string | null;   // ✅ FIXED
}

export default function GetValidTokenStatus({
    isRefreshing,
    error,
}: Props) {
    if (isRefreshing) {
        return (
            <div className="text-blue-600 text-sm mt-2">
                ⚠️ Your credentials are about to expire. Requesting new credentials from your Drive...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-600 text-sm mt-2">
                ❌ Error: {error}
            </div>
        );
    }

    return null;
}