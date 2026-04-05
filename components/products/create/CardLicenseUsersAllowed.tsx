'use client';

import { useState, useEffect } from "react";
import { ZodError } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Validation functions
import ErrorAlert from "@/components/banners/ErrorAlert";
import { licuserspaidSchema } from "@/lib/zod/licenses/licuserspaidSchema";
import { licusersfreeSchema } from "@/lib/zod/licenses/licusersfreeSchema";
import { MembershipEnum } from "@/lib/enum/MembershipEnum";

interface CardLicenseUsersAllowedProps {
  value?: number;
  cardTitle?: string;
  setValue?: (value: number) => void; // Parent setter to update value
  membership?: MembershipEnum;
}

export default function CardLicenseUsersAllowed({
  value = 0,
  cardTitle = "Users Allowed",
  setValue,
  membership = MembershipEnum.Free,
}: CardLicenseUsersAllowedProps) {
  const [usersAllowed, setUsersAllowed] = useState(value);
  const [error, setError] = useState<string | null>(null);

  // Sync local state if parent value changes
  useEffect(() => {
    setUsersAllowed(value);
  }, [value]);

  // Validate and update parent state on blur
  const handleBlur = () => {
    try {      
      let validatedUsersAllowed = isNaN(usersAllowed) ? 0 : usersAllowed;
      membership === MembershipEnum.Free ? licusersfreeSchema.parse(validatedUsersAllowed) : licuserspaidSchema.parse(validatedUsersAllowed);
      
      setError(null);
      setUsersAllowed(validatedUsersAllowed);

      // Update parent only after validation
      if (setValue) {
        setValue(validatedUsersAllowed);
      }
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        setError(err.issues[0]?.message || "Invalid users allowed");
      } else {
        setError("Unexpected error for LicenseUsers Allowed");
      }
    }
  };

  return (
    <section id="product-users-allowed">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <input
            type="number"
            placeholder="Users Allowed"
            value={usersAllowed}
            onChange={(e) => setUsersAllowed(parseFloat(e.target.value))}
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
