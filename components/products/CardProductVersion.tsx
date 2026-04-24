'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ZodError } from "zod";
import { versionSchema } from "@/lib/zod/schemas/version.schema";
import FieldError from "../banners/FieldError";
import FieldWarning from "../banners/FieldWarning";

interface ProductVersionCardProps {
  cardTitle?: string;
  value?: string;
  onChange?: (value: string) => void;
  onVersion?: (value: boolean) => void;
  showOptional?: boolean; // Optional prop to show "(Optional)" span
}

export default function CardProductVersion({
  cardTitle = "Product Version",
  value = "",
  onChange,
  onVersion,
  showOptional = true,
}: ProductVersionCardProps) {
  const [version, setVersion] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false); // State for the checkbox (checked by default)

  // Lift trimmed value to parent form automatically
  useEffect(() => {
    if (onChange) {
      onChange(version.trim());
    }
  }, [version, onChange]);

  // Validate on blur
  const handleBlur = () => {
    try {
      const schema = versionSchema(true);
      const parsed = schema.parse(version); // Validate the version
      setError(null); // No error if valid
      setVersion(parsed || ""); // Set the validated version
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        setError(err.issues[0]?.message || "Invalid version format");
      } else {
        setError("Unexpected error");
      }
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    onVersion?.(checked);

    if (!checked) {
      setVersion(""); // Clear version input if unchecked
      setError(null); // Optionally clear error if unchecked
    }
  };

  return (
    <section id="product-version">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>{cardTitle} {showOptional && <span className="text-sm text-gray-500">(Optional)</span>}</CardTitle>          
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <input
            type="text"
            placeholder={isChecked ? "Enter version" : "No Version"}
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            onBlur={handleBlur} // Trigger validation on blur
            disabled={!isChecked} // Disable input if checkbox is unchecked
            className={`border p-2 rounded w-full ${error ? "border-red-500" : ""}`}
          />
          {error &&
            <>
            <FieldError message={error} iconSize={20} />
            <FieldWarning message={"Version Format: 1.0.0"} iconSize={20} />
          </>
          }

          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange} // Handle checkbox change
              className="mr-2"
            />
            <label>Include a Version Number</label>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
