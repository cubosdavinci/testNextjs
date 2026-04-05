'use client';

import React from "react";
import { NewProductLicense } from "@/lib/db/products/types/NewProductLicense";
import CardProductPrice from "./create/CardLicensePrice";
import CardLicenseType from "./CardLicenseType";

interface CardLicenseInfoProps {
  index: number;
  license: NewProductLicense;
  licenseTypes: { id: number; name: string }[];
  handleLicenseChange: (
    index: number,
    field: keyof NewProductLicense,
    value: any
  ) => void;
  removeLicense: (index: number) => void;
}

export default function CardLicenseInfo({
  index,
  license,
  licenseTypes,
  handleLicenseChange,
  removeLicense,
}: CardLicenseInfoProps) {

  function onLicenseTypeChange(typeId: number) {
    const selected = licenseTypes.find((t) => t.id === typeId);
    if (!selected) return;

    handleLicenseChange(index, "typeId", selected.id);
    handleLicenseChange(index, "typeName", selected.name);
  }

  return (
    <div className="border p-4 my-4 rounded-md shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">
          License {index + 1} {license.isMain && "(Main)"}
        </h3>
        {!license.isMain && (
          <button
            type="button"
            className="text-red-500 hover:underline"
            onClick={() => removeLicense(index)}
          >
            Remove
          </button>
        )}
      </div>

      <div className="space-y-4 mt-4">
        <CardProductPrice
          price={license.price}
          onChange={(price) => handleLicenseChange(index, "price", price)}
        />

        <CardLicenseType
          selectedType={license.typeId}
          licenseTypes={licenseTypes}
          onChange={onLicenseTypeChange}
        />

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
}
