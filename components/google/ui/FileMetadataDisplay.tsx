import { GoogleDriveFileMetadata } from "@/types/google";

interface Props {
    metadata: GoogleDriveFileMetadata;
}

export default function FileMetadataDisplay({ metadata }: Props) {
    // Helper to format bytes to a human-readable string
    const formatSize = (bytes: string | undefined) => {
        if (!bytes) return 'N/A';
        const sizeInBytes = parseInt(bytes);
        if (sizeInBytes < 1024) return `${sizeInBytes} B`;
        if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(2)} KB`;
        return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm space-y-2">
            <p><strong>Size:</strong> {formatSize(metadata.size)}</p>
            <p><strong>Created:</strong> {new Date(metadata.createdTime).toLocaleString()}</p>
            <p><strong>Last Modified:</strong> {new Date(metadata.modifiedTime).toLocaleString()}</p>
            <p><strong>Owner:</strong> {metadata.owners?.[0]?.displayName || 'Unknown'}</p>

            {metadata.md5Checksum && (
                <p className="truncate">
                    <strong>MD5:</strong> <code>{metadata.md5Checksum}</code>
                </p>
            )}

            {metadata.webContentLink && (
                <p>
                    <a
                        href={metadata.webContentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        View in Google Drive
                    </a>
                </p>
            )}
        </div>
    );
}