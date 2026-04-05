'use client';

import { useState, useEffect, useCallback } from "react";
import CardProductPrice from "./CardLicensePrice";
import { consoleLog } from "@/lib/utils";




// Types
export interface NewProductLicense {
  typeId: number;
  typeName: string;
  price: number;
  isMain: boolean;
}

interface LicenseType {
  id: number;
  name: string;
}

// Props
interface CardProductLicensesProps {
  creatorId: string;
  onChange?: (licenses: NewProductLicense[]) => void;
}

export default function CardProductLicenses({
  creatorId,
  onChange,
}: CardProductLicensesProps) {
  consoleLog("🔔 ⭐ Client Component Starts (components/products/create/CardProductLicenses.tsx)");

  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);
  const [licenses, setLicenses] = useState<NewProductLicense[]>([]);

  // Fetch license types from API
  useEffect(() => {
    async function fetchLicenseTypes() {
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
        const types = (data ?? []).map((t: any) => ({ id: t.id, name: t.name }));
        setLicenseTypes(types);

        // Initialize first license if none
        if (types.length > 0 && licenses.length === 0) {
          setLicenses([
            {
              price: 0,
              typeId: types[0].id,
              typeName: types[0].name,
              isMain: true,
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch license types", err);
      }
    }

    fetchLicenseTypes();
  }, [creatorId]);

  // Lift licenses to parent
  useEffect(() => {
    onChange?.(licenses);
  }, [licenses, onChange]);

  // Add license
  const addLicense = () => {
    if (!licenseTypes.length) return;
    const defaultType = licenseTypes[0];
    setLicenses((prev) => [
      ...prev,
      { price: 0, typeId: defaultType.id, typeName: defaultType.name, isMain: false },
    ]);
  };

  // Remove license (cannot remove main license)
  const removeLicense = (index: number) => {
    setLicenses((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((l) => l.isMain)) {
        updated[0].isMain = true;
      }
      return updated;
    });
  };

  // Update license
  const handleLicenseChange = useCallback(
    (index: number, field: keyof NewProductLicense, value: any) => {
      setLicenses((prev) =>
        prev.map((license, i) => {
          if (field === "isMain") return { ...license, isMain: i === index };
          if (i === index) return { ...license, [field]: value };
          return license;
        })
      );
    },
    []
  );

  // ----- Nested License Card -----
  const LicenseCard = ({ index, license }: { index: number; license: NewProductLicense }) => (
    <div className="border p-4 my-4 rounded-md shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">
          License {index + 1} {license.isMain && "(Main)"}
        </h3>
        {!license.isMain && (
          <button
            type="button"
            onClick={() => removeLicense(index)}
            className="w-8 h-8 flex items-center justify-center bg-red-600 text-white font-bold rounded hover:bg-red-700 transition"
          >
            ×
          </button>
        )}
      </div>

      <div className="space-y-4 mt-4">
        {/* Price */}
        <CardProductPrice
          value={licenses[index].price} // initial value
          setValue={(newPrice) => setLicenses(prev => {
            const updated = [...prev];
            updated[index].price = newPrice; // directly update parent state
            return updated;
          })}
        />

        {/* License Type */}
        <div>
          <label className="block font-medium">License Type</label>
          <select
            value={license.typeId}
            className="border p-2 rounded w-full"
            onChange={(e) => {
              const typeId = Number(e.target.value);
              const type = licenseTypes.find((t) => t.id === typeId);
              if (!type) return;
              handleLicenseChange(index, "typeId", type.id);
              handleLicenseChange(index, "typeName", type.name);
            }}
          >
            {licenseTypes.map((lt) => (
              <option key={lt.id} value={lt.id}>
                {lt.name}
              </option>
            ))}
          </select>
        </div>

        {/* Main License */}
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-1">
            <input
              type="radio"
              checked={license.isMain}
              onChange={() => handleLicenseChange(index, "isMain", true)}
              className="accent-blue-600"
            />
            <span>Main License</span>
          </label>
        </div>
      </div>
    </div>
  );

  // ----- Render -----
  return (
    <section id="product-licenses" className="space-y-2">
      {licenses.map((license, index) => (
        <LicenseCard key={index} index={index} license={license} />
      ))}

      <button
        type="button"
        className="px-3 py-1 bg-green-500 text-white rounded mt-2 hover:bg-green-600 transition"
        onClick={addLicense}
      >
        Add Another License
      </button>
    </section>
  );
}
