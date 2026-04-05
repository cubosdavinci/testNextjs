// components/supabase/products/ProductThumbnail.tsx
'use client';

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  thumbnailUrl?: string; // initial URL if editing existing product
  onChange: (file: File | null) => void; // callback to parent with selected file
}

export default function ProductThumbnail({ thumbnailUrl = "", onChange }: Props) {
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(thumbnailUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update preview whenever a new file is selected
  useEffect(() => {
    if (localFile) {
      const objectUrl = URL.createObjectURL(localFile);
      setPreviewUrl(objectUrl);

      // Cleanup memory when file changes or component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(thumbnailUrl); // fallback to initial URL
    }
  }, [localFile, thumbnailUrl]);

  const handleFileSelect = (file: File) => {
    setLocalFile(file);
    onChange(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const removeFile = () => {
    setLocalFile(null);
    onChange(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thumbnail</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div
          className="w-full h-48 border-2 border-dashed rounded flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Thumbnail preview" className="max-h-full object-contain" />
          ) : (
            <span className="text-gray-400">Click to select or drag & drop an image</span>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={inputRef}
          onChange={handleInputChange}
        />

        {previewUrl && (
          <div className="flex gap-2">
            <button
              type="button"
              className="px-3 py-1 bg-yellow-500 text-white rounded"
              onClick={() => inputRef.current?.click()}
            >
              Change
            </button>
            <button
              type="button"
              className="px-3 py-1 bg-red-500 text-white rounded"
              onClick={removeFile}
            >
              Remove
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
