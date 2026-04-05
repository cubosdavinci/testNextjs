'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { validateProductDescription } from "@/lib/validate/products/description"; // Import the description validation
import { ZodError } from "zod";
import TipTapEditor from "@/components/ui/TipTapEditor"; // Assuming this is the rich text editor component
import { consoleLog } from "@/lib/utils";

interface ProductDescriptionCardProps {
  cardTitle?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function CardProductDescription({
  cardTitle = "Product Description",
  value = "",
  onChange,
}: ProductDescriptionCardProps) {
  const [editor, setEditor] = useState(value);
  const [error, setError] = useState<string | null>(null);

  // Lift trimmed value to parent form automatically
  useEffect(() => {
    if (onChange) {
      onChange(editor.trim());
    }
  }, [editor, onChange]);

  // Validate on blur
  const handleBlur = () => {
    try {
      consoleLog("Handling Error")
      const parsed = validateProductDescription.parse(editor); // Validate the description
      setError(null); // No error if valid
      setEditor(parsed || ""); // Update with trimmed value if valid
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        setError(err.issues[0]?.message || "Invalid description");
      } else {
        setError("Unexpected error");
      }
    }
  };

  return (
    <section id="product-description">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <TipTapEditor
            value={editor}
            onChange={setEditor}
            onBlur={handleBlur} // Trigger validation on blur (if needed)
          />
          {error && <span className="text-red-500 text-sm">{error}</span>}
        </CardContent>
      </Card>
    </section>
  );
}
