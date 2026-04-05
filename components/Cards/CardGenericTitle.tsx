'use client';
// React
import { useState, useEffect } from "react";
// Cards
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Zod
import { ZodError } from "zod";
import { titleSchema } from "@/lib/zod/titleSchema";
// Banners
import ErrorAlert from "@/components/banners/ErrorAlert";

interface CardGenericTitleProps {
  cardTitle?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  setValue?: (value: string) => void;
  minChars?: number;
  maxChars?: number;
  regExp?: string;              // Optional regex pattern as string
  errMessage?: string;    // Custom error message for regex validation
}


export default function CardGenericTitle({
  required = true,
  cardTitle = "Title",
  placeholder = "Enter a title",
  value = "",
  setValue,
  minChars,
  maxChars,
  regExp,
  errMessage, // <-- new prop
}: CardGenericTitleProps) {
  const [title, setTitle] = useState(value);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(value);
  }, [value]);

  const handleBlur = () => {
    try {
      // Convert string to RegExp if provided
      const regex = regExp ? new RegExp(regExp) : undefined;

      // Pass custom regex error message to validation
      const parsed = titleSchema(
        minChars,
        maxChars,
        regex,
        errMessage
      ).parse(title);

      setError(null);
      setTitle(parsed);
      if (setValue) setValue(parsed);
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        setError(err.issues[0]?.message || "Invalid title");
      } else {
        setError("Unexpected error");
      }
    }
  };

  // Modify placeholder based on required flag
  const placeholderWithSuffix = `${placeholder}${required ? " (required)" : " (optional)"}`;

  return (
    <section id="product-title">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
            {cardTitle}
            {required && <span className="text-red-500"> *</span>}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-2">
          <input
            type="text"
            placeholder={placeholderWithSuffix}
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
