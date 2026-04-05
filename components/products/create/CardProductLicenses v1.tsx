'use client';

import { useState, useEffect } from "react";
import CardLicenseInfo from "../CardLicenseInfo";
import { LicenseType } from "@/types/db/licenses";
import { consoleLog } from "@/lib/utils";
import { NewProductLicense } from "@/lib/db/products/types/NewProductLicense";

interface CardProductLicensesProps {
  creatorId: string; // needed for fetching license types
  onChange?: (licenses: NewProductLicense[]) => void; // optional callback to parent
}

export default function CardProductLicenses({ creatorId, onChange }: CardProductLicensesProps) {
  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);
  const [licenses, setLicenses] = useState<NewProductLicense[]>([]);

  // Fetch license types on mount
  useEffect(() => {

    
    async function fetchLicenseTypes() {
      consoleLog("Fetching license types...");
      try {
        const res = await fetch("/api/licenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operationName: "GetLicenseTypes",
            variables: { clientId: creatorId },
          }),
        });
        const data = await res.json();
        setLicenseTypes(data ?? []);

        // Initialize licenses with one default license
        if (data?.length > 0) {
          setLicenses([
            { price: 0, typeId: data[0].id, typeName: data[0].name, isMain: true },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch license types", err);
      }
    }
    fetchLicenseTypes();
  }, [creatorId]);

  // Notify parent when licenses change
  useEffect(() => {
    onChange?.(licenses);
  }, [licenses]);

  const handleLicenseChange = (index: number, field: keyof NewProductLicense, value: any) => {
    setLicenses((prev) => {
      const current = prev[index];
      
      // Check if the value actually changed
      if (field !== "isMain" && current[field] === value) {
        return prev; // no update needed
      }

      const newLicenses = [...prev];

      if (field === "isMain") {
        newLicenses.forEach((l, i) => (l.isMain = i === index));
      } else {
        newLicenses[index] = { ...newLicenses[index], [field]: value };
      }

      return newLicenses;
    });
  };

  const addLicense = () => {
    if (licenseTypes.length === 0) return;

    setLicenses((prev) => [
      ...prev,
      {
        price: 0,
        typeId: licenseTypes[0].id,
        type: licenseTypes[0],
        isMain: false,
      },
    ]);
  };

  const removeLicense = (index: number) => {
    setLicenses((prev) => {
      const newLicenses = prev.filter((_, i) => i !== index);
      if (!newLicenses.some((l) => l.isMain) && newLicenses.length > 0) {
        newLicenses[0].isMain = true;
      }
      return newLicenses;
    });
  };

  return (
    <section id="product-licenses" className="space-y-2">
      {licenses.map((license, index) => (
        <CardLicenseInfo
          key={index}
          index={index}
          license={license}
          licenseTypes={licenseTypes}
          handleLicenseChange={handleLicenseChange}
          removeLicense={removeLicense}
        />
      ))}

      <button
        type="button"
        className="px-3 py-1 bg-green-500 text-white rounded mt-2"
        onClick={addLicense}
      >
        Add Another License
      </button>
    </section>
  );
}
