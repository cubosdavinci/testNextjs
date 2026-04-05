'use client';

import { useState } from "react";
import { GoogleDriveMetadata } from "@/lib/db/products/types/GoogleDriveMetadata";
import { fetchMetadataFromDownloadLink } from "@/lib/db/products/helpers/fetchMetadataFromDownloadLink";
import ErrorAlert from "@/components/banners/ErrorAlert";

export default function TestDriveMetadataPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [googleDriveMetadata, setGoogleDriveMetadata] = useState<GoogleDriveMetadata | null>(null);

  const downloadLink =
    "https://drive.google.com/file/d/1Wap7HyNu1ISMspVTF1-GYwSrMHQ-9MnY/view?usp=drive_link";

  const handleFetchMetadata = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Fetch metadata using the helper function
      const metadata = await fetchMetadataFromDownloadLink(downloadLink);

      // Set the metadata and result state
      setGoogleDriveMetadata(metadata);
      setResult(metadata);
    } catch (err: any) {
      // Catch any error and set it
      setError(err.message || "Unexpected error while fetching file metadata.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProductFile = async () => {
    if (!googleDriveMetadata) {
      setError("No metadata available to create product file.");
      return;
    }

    setLoading(true);
    setError(null);

    // Use the fileMetadata response directly from fetchMetadataFromDownloadLink
    const productFileVars = {
      productId: "334029a8-0c95-4460-860d-72d114772790", // Replace with the actual product ID
      downloadLink:downloadLink, // Use the existing download link from metadata
      software: "Blender", // You requested to set this to "Blender"
      fileMetadata: googleDriveMetadata, // Pass the full metadata directly
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationName: "InsertNewProductFile",
          variables: productFileVars,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to create product file.");
      } else {
        // Handle successful creation
        console.log("Product File created successfully:", data);
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Google Drive File Metadata Test</h1>
      <p className="mb-2">Download Link: {downloadLink}</p>

      <button
        onClick={handleFetchMetadata}
        className="px-4 py-2 bg-blue-600 text-white rounded mb-4"
        disabled={loading}
      >
        {loading ? "Fetching..." : "Fetch Metadata"}
      </button>

      {error && <ErrorAlert message={error} />}

      {result && (
        <div className="bg-gray-100 p-4 rounded space-y-2">
          <h2 className="font-semibold mb-2">File Metadata:</h2>
          <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          {result.sizeKB && <p>Size: {result.sizeKB}</p>}
          {result.iconLink && (
            <p>
              Icon: <img src={result.iconLink} alt="file icon" className="inline w-6 h-6 ml-1" />
            </p>
          )}
          {result.createdTimeFormatted && <p>Created: {result.createdTimeFormatted}</p>}
          {result.modifiedTimeFormatted && <p>Modified: {result.modifiedTimeFormatted}</p>}

          {/* MD5 Checksum Highlight */}
          <div
            className={`p-2 rounded ${
              result.hasMd5Checksum ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {result.hasMd5Checksum
              ? `MD5 Checksum: ${result.md5Checksum}`
              : "No MD5 checksum available"}
          </div>
        </div>
      )}

      {/* Create New Product File Button */}
      <button
        onClick={handleCreateProductFile}
        className="px-4 py-2 bg-green-600 text-white rounded mt-4"
        disabled={loading || !googleDriveMetadata}
      >
        {loading ? "Creating..." : "Create New ProductFile"}
      </button>
    </div>
  );
}
