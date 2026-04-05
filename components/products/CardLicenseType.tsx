'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CardLicenseTypeProps {
  selectedType: number; // typeId is always a number
  licenseTypes: { id: number; name: string }[];
  onChange: (typeId: number) => void; // always number
}

export default function CardLicenseType({
  selectedType,
  licenseTypes,
  onChange,
}: CardLicenseTypeProps) {
  const [selectedLicenseType, setSelectedLicenseType] = useState<number>(selectedType);

  // Lift value to parent automatically
  useEffect(() => {
    onChange(selectedLicenseType);
  }, [selectedLicenseType, onChange]);

  return (
    <section id="license-type">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>License Type</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <select
            value={selectedLicenseType}
            onChange={(e) => setSelectedLicenseType(Number(e.target.value))}
            className="border p-2 rounded w-full"
          >
            {licenseTypes.map((lt) => (
              <option key={lt.id} value={lt.id}>
                {lt.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>
    </section>
  );
}
