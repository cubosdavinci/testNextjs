import { DriveMetadata } from "@/types/db/products";

interface CardSrcLinkMetadataProps {
  metadata: DriveMetadata;
}

export function CardSrcLinkMetadata({ metadata }: CardSrcLinkMetadataProps) {
  return (
    <div className="bg-gray-100 p-4 rounded mt-2 space-y-2">
      <h4 className="font-semibold">File Metadata</h4>
      {metadata.name && <p>Name: {metadata.name}</p>}
      {metadata.sizeKB && <p>Size: {metadata.sizeKB}</p>}
      {metadata.mimeType && <p>Type: {metadata.mimeType}</p>}
      {metadata.iconLink && (
        <p>
          Icon: <img src={metadata.iconLink} alt="icon" className="inline w-6 h-6 ml-1" />
        </p>
      )}
      {metadata.createdTimeFormatted && <p>Created: {metadata.createdTimeFormatted}</p>}
      {metadata.modifiedTimeFormatted && <p>Modified: {metadata.modifiedTimeFormatted}</p>}

      {/* MD5 Checksum Highlight */}
      <div
        className={`p-2 rounded ${
          metadata.hasMd5Checksum ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {metadata.hasMd5Checksum
          ? `MD5 Checksum: ${metadata.md5Checksum}`
          : "No MD5 checksum available"}
      </div>
    </div>
  );
}
