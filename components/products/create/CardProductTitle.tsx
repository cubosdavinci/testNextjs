'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { validateGenericTitle } from "@/lib/zod/titleSchema";
import { ZodError } from "zod";
import ErrorAlert from "@/components/banners/ErrorAlert";

interface ProductTitleCardProps {
  cardTitle?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function CardProductTitle({
  cardTitle = "Product Title",
  value = "",
  onChange,
}: ProductTitleCardProps) {
  const [title, setTitle] = useState(value);
  const [error, setError] = useState<string | null>(null);

  // Lift trimmed value to parent form automatically
  useEffect(() => {
    if (onChange) {
      onChange(title.trim());
    }
  }, [title, onChange]);

  // Validate on blur
  const handleBlur = () => {
    try {
      const parsed = validateGenericTitle(1, 50).parse(title);
      setError(null);
      setTitle(parsed); // update with trimmed value
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        setError(err.issues[0]?.message || "Invalid title");
      } else {
        setError("Unexpected error");
      }
    }
  };

  return (
    <section id="product-title">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{cardTitle} <span className="text-red-500">*</span></CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="A title is required"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleBlur}
            className={`border p-2 rounded w-full ${error ? "border-red-500" : ""}`}
          />
          {error && <ErrorAlert message={error} />}
        </CardContent>
      </Card>
    </section>
  );
}
