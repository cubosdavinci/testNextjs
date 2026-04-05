'use client';

import { useState, useEffect } from "react";
import { ZodError } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Validation functions
import { licpricefreeSchema } from "@/lib/zod/licenses/licpricefreeSchema";
import { licpricepaidSchema } from "@/lib/zod/licenses/licpricepaidSchema";
import ErrorAlert from "@/components/banners/ErrorAlert";
import { MembershipEnum } from "@/lib/enum/MembershipEnum";

interface CardLicensePriceProps {
  value?: number;
  cardTitle?: string;
  setValue?: (value: number) => void; // Parent setter to update value
  membership?: MembershipEnum;
}

export default function CardLicensePrice({
  value = 0,
  cardTitle = "Price",
  setValue,
  membership = MembershipEnum.Free,
}: CardLicensePriceProps) {
  const [price, setPrice] = useState(value);
  const [error, setError] = useState<string | null>(null);

  // Sync local state if parent value changes
  useEffect(() => {
    setPrice(value);
  }, [value]);

  // Validate and update parent state on blur
  const handleBlur = () => {
    try {
      let validatedPrice = isNaN(price) ? 0 : price;
      membership === MembershipEnum.Free ? licpricefreeSchema.parse(validatedPrice) : licpricepaidSchema.parse(validatedPrice);

      setError(null);
      setPrice(validatedPrice);

      // Update parent only after validation
      if (setValue) {
        setValue(validatedPrice);
      }
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        setError(err.issues[0]?.message || "Invalid price");
      } else {
        setError("Unexpected error");
      }
    }
  };

  return (
    <section id="license-price">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            onBlur={handleBlur}
            className={`border p-2 rounded w-full ${error ? "border-red-500" : ""}`}
            required
          />
          {error && <ErrorAlert message={error} />}
        </CardContent>
      </Card>
    </section>
  );
}
