'use client';
import { useState, useEffect } from "react";
//enums
import { MembershipEnum } from "@/lib/enum/MembershipEnum";
// Zod Schemas
import { ZodError } from "zod/v4";
import { licdevicesfreeSchema } from "@/lib/zod/licenses/licdevicesfreeSchema";
import { licdevicespaidSchema } from "@/lib/zod/licenses/licdevicespaidSchema";
// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ErrorAlert from "@/components/banners/ErrorAlert";

interface CardLicenseDevicesAllowedProps {
  value?: number;
  cardTitle?: string;
  setValue?: (value: number) => void; // Parent setter to update value
  membership?: MembershipEnum;  
}

export default function CardLicenseDevicesAllowed({
  value = 0,
  cardTitle = "Devices Allowed",
  setValue,
  membership = MembershipEnum.Free,
}: CardLicenseDevicesAllowedProps) {
  const [devicesAllowed, setDevicesAllowed] = useState(value);
  const [error, setError] = useState<string | null>(null);

  // Sync local state if parent value changes
  useEffect(() => {
    setDevicesAllowed(value);
  }, [value]);

  // Validate and update parent state on blur
  const handleBlur = () => {
    try {
      let validatedDevicesAllowed = isNaN(devicesAllowed) ? 0 : devicesAllowed;
      membership === MembershipEnum.Free ? licdevicesfreeSchema.parse(validatedDevicesAllowed) : licdevicespaidSchema.parse(validatedDevicesAllowed);

      setError(null);
      setDevicesAllowed(validatedDevicesAllowed);

      // Update parent only after validation
      if (setValue) {
        setValue(validatedDevicesAllowed);
      }
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        setError(err.issues[0]?.message || "Invalid devices allowed");
      } else {
        setError("Unexpected error for License: Devices Allowed");
      }
    }
  };

  return (
    <section id="product-devices-allowed">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <input
            type="number"
            placeholder="Devices Allowed"
            value={devicesAllowed}
            onChange={(e) => setDevicesAllowed(parseFloat(e.target.value))}
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
