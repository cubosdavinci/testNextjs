// CardLicenseInfo.tsx
'use client';

import { License, LicenseType } from "@/types/db/licenses";
import CardProductPrice from "./create/CardLicensePrice"; // Assumed component for price
import CardSelectLicenseType from "./CardLicenseType"; // Assumed component for license type
import CardProductDownloadLink from "./create/CardProductDownloadLink"; // Assumed existing component

interface CardLicenseInfoProps {
  index: number;
  license: License;
  licenseTypes: LicenseType[];
  handleLicenseChange: (index: number, field: keyof License, value: any) => void;
  removeLicense: (index: number) => void;
}

const CardLicenseInfo = ({
  index,
  license,
  licenseTypes,
  handleLicenseChange,
  removeLicense,
}: CardLicenseInfoProps) => {
  return (
    <div className="border p-4 my-4">
      <div className="flex justify-between items-center">
        <h3>License {index + 1} {license.isMain && "(Main)"}</h3>
        {index > 0 && (
          <button
            type="button"
            className="text-red-500"
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
        <CardSelectLicenseType
          selectedType={license.typeId}
          licenseTypes={licenseTypes}
          onChange={(typeId) => handleLicenseChange(index, "typeId", typeId)}
        />
       

        <div className="flex items-center space-x-2">
          <label>
            <input
              type="radio"
              checked={license.isMain}
              onChange={() => handleLicenseChange(index, "isMain", true)}
            />{" "}
            Main License
          </label>
        </div>
      </div>
    </div>
  );
};

export default CardLicenseInfo;
