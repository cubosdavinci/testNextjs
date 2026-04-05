'use client';

import { useState, useEffect } from "react";
import { ZodError } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { validateGoogleDriveLink } from "@/lib/validate/products/validateGoogleDriveLink";
import ErrorAlert from "@/components/banners/ErrorAlert";

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

  // Lift trimmed value to parent form automatically
  useEffect(() => {
    if (onChange) {
      onChange(srcDownloadLink.trim());
    }
  }, [srcDownloadLink, onChange]);

  // Validate on blur
  const handleBlur = () => {
    try {
      const parsed = validateGoogleDriveLink.parse(srcDownloadLink); // Validate the URL
      setError(null); // No error if valid
      setSrcDownloadLink(parsed); // Set the validated value
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        setError(err.issues[0]?.message || "Invalid link"); // Show the error message from Zod
      } else {
        setError("Unexpected error"); // Catch any unexpected errors
      }
    }
  };

  return (
    <section id="product-download-link">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Google Drive (share) Link"
            value={srcDownloadLink}
            onChange={(e) => setSrcDownloadLink(e.target.value)}
            onBlur={handleBlur} // Trigger validation on blur
            className={`border p-2 rounded w-full ${error ? "border-red-500" : ""}`}
            required
          />
          {error && <ErrorAlert message={error} />} {/* Replace span with ErrorAlert */}
        </CardContent>
      </Card>
    </section>
  );
}
