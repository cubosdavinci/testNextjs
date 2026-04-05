'use client';

import { useState, useEffect } from "react";
import { ZodError } from "zod"; // Assuming you're using Zod for validation
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Assuming these are your validation functions
import { validateProductPriceFreeMemberships } from "@/lib/zod/licenses/licpricefreeSchema";
import { validateProductPricePaidMemberships } from "@/lib/zod/licenses/licpricepaidSchema";

interface CardProductPriceProps {
  price?: number;
  cardTitle?: string;
  value?: number;
  onChange?: (value: number) => void;
  isPaidMembership?: boolean; // New prop to decide which validation to apply
}

export default function CardProductPrice({
  cardTitle = "Price",
  value = 0,
  onChange,
  isPaidMembership = false, // Default to false if not provided
}: CardProductPriceProps) {
  const [price, setPrice] = useState(value);
  const [error, setError] = useState<string | null>(null);

  // Lift trimmed value to parent form automatically
  useEffect(() => {
    if (onChange) {
      onChange(price); // Pass the price to the parent when it changes
    }
  }, [price, onChange]);

  // Handle validation based on membership type
  const handleBlur = () => {
    try {
      if (isPaidMembership) {
        // If it's a paid membership, use this validation
        const parsed = validateProductPricePaidMemberships.parse(price);
        setError(null); // No error if valid
        setPrice(parsed); // Set the validated value
      } else {
        // If it's a free membership, use this validation
        const parsed = validateProductPriceFreeMemberships.parse(price);
        setError(null); // No error if valid
        setPrice(parsed); // Set the validated value
      }
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        setError(err.issues[0]?.message || "Invalid price"); // Show the error message from Zod
      } else {
        setError("Unexpected error"); // Catch any unexpected errors
      }
    }
  };

  return (
    <section id="product-price">
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
            onBlur={handleBlur} // Trigger validation on blur
            className={`border p-2 rounded w-full ${error ? "border-red-500" : ""}`}
            required
          />
          {error && <span className="text-red-500 text-sm">{error}</span>} {/* Error message */}
        </CardContent>
      </Card>
    </section>
  );
}