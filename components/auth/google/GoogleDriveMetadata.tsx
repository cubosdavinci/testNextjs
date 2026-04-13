'use client';

interface GooglePickerDoc {
    id: string;
    name: string;
    mimeType: string;
    url?: string;
    sizeBytes?: number;
    [key: string]: unknown;
}

interface GooglePickerData {
    action: string;
    docs?: GooglePickerDoc[];
    [key: string]: unknown;
}

type Props = {
    data: GooglePickerData | null;
};

export default function GoogleDriveMetadata({ data }: Props) {
    if (!data || data.action !== 'picked' || !data.docs?.length) {
        return null;
    }

    const file = data.docs[0];

    const downloadUrl = file.id
        ? `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`
        : null;

    const viewUrl = file.id
        ? `https://drive.google.com/file/d/${file.id}/view`
        : null;

    return (
        <div className="mt-4 p-4 border rounded bg-gray-50 space-y-2">
            <h3 className="font-semibold text-lg">📄 Selected File</h3>

            <p>
                <strong>Name:</strong> {file.name}
            </p>

            <p>
                <strong>MIME Type:</strong> {file.mimeType}
            </p>

            {file.sizeBytes && (
                <p>
                    <strong>Size:</strong> {Math.round(file.sizeBytes / 1024)} KB
                </p>
            )}

            <div className="flex gap-3 mt-2">
                {viewUrl && (
                    <a
                        href={viewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                    >
                        Open in Drive
                    </a>
                )}

                {downloadUrl && (
                    <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 underline"
                    >
                        Download
                    </a>
                )}
            </div>
        </div>
    );
}