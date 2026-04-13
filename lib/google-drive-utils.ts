// lib/google-drive-utils.ts
export const validateGoogleToken = async (accessToken: string): Promise<boolean> => {
    try {
        const res = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return res.ok;
    } catch {
        return false;
    }
};

export const fetchDriveFileContent = async (fileId: string, accessToken: string) => {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) throw new Error('Failed to fetch file content');
    return await res.json();
};

export const downloadDriveFileBlob = async (fileId: string, accessToken: string): Promise<Blob> => {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
        throw new Error(`Failed to download file: ${res.statusText}`);
    }

    return await res.blob();
};