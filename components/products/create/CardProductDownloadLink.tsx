'use client';

import { useState, useEffect } from "react";
import { ZodError } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { validateGoogleDriveLink } from "@/lib/validate/products/validateGoogleDriveLink";
import ErrorAlert from "@/components/banners/ErrorAlert";
import { DriveMetadata } from "@/types/db/products";
import { CardSrcLinkMetadata } from "./CardSrcLinkMetadata";

interface CardProductDownloadLinkProps {
  cardTitle?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function CardProductDownloadLink({
  cardTitle = "Download Link (source)",
  value = "",
  onChange,
}: CardProductDownloadLinkProps) {
  const [srcDownloadLink, setSrcDownloadLink] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<DriveMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  // Lift trimmed value to parent form automatically
  useEffect(() => {
    if (onChange) onChange(srcDownloadLink.trim());
  }, [srcDownloadLink, onChange]);

  // Extract fileId from Google Drive URL
  const extractFileId = (url: string) => {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  // Fetch metadata
  const fetchMetadata = async (fileId: string) => {
    setLoading(true);
    setError(null);
    setMetadata(null);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationName: "getGoogleDriveMetadata",
          variables: { fileId },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to fetch metadata");
        setMetadata(null);
      } else {
        if (data.size) data.sizeKB = `${(parseInt(data.size, 10) / 1024).toFixed(2)} KB`;
        if (data.createdTime) data.createdTimeFormatted = new Date(data.createdTime).toLocaleString();
        if (data.modifiedTime) data.modifiedTimeFormatted = new Date(data.modifiedTime).toLocaleString();
        data.hasMd5Checksum = !!data.md5Checksum;

        setMetadata(data);
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error");
      setMetadata(null);
    } finally {
      setLoading(false);
    }
  };

  // Validate and fetch metadata
  const handleBlur = () => {
    try {
      const parsed = validateGoogleDriveLink.parse(srcDownloadLink);
      setError(null);
      setSrcDownloadLink(parsed);

      const fileId = extractFileId(parsed);
      if (fileId) fetchMetadata(fileId);
      else {
        setError("Cannot extract file ID from URL");
        setMetadata(null);
      }
    } catch (err: unknown) {
      if (err instanceof ZodError) setError(err.issues[0]?.message || "Invalid link");
      else setError("Unexpected error");
      setMetadata(null);
    }
  };

  // Clear metadata if input becomes invalid
  useEffect(() => {
    if (!srcDownloadLink) {
      setMetadata(null);
      setError(null);
    }
  }, [srcDownloadLink]);

  return (
    <section id="product-download-link">
      <Card className="w-full max-w-lg">
        <CardHeader>          
          <CardTitle>{cardTitle} <span className="text-red-500">*</span></CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="This link will remain private."
            value={srcDownloadLink}
            onChange={(e) => setSrcDownloadLink(e.target.value)}
            onBlur={handleBlur}
            className={`border p-2 rounded w-full ${error ? "border-red-500" : ""}`}            
          />

          {error && <ErrorAlert message={error} />}
          {loading && <p className="text-gray-500">Fetching metadata...</p>}
          {metadata && <CardSrcLinkMetadata metadata={metadata} />}
        </CardContent>
      </Card>
    </section>
  );
}
