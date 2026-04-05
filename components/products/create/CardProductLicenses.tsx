'use client';

import { useState, useEffect, useCallback } from "react";
import { consoleLog } from "@/lib/utils";
import { RegionEnum } from "@/lib/db/licenses/types/enums/RegionEnum";
import { ValidPeriodEnum } from "@/lib/db/licenses/types/enums/ValidPeriodEnum";
import CardLicenseUsersAllowed from "./CardLicenseUsersAllowed";
import CardLicenseDevicesAllowed from "./CardLicenseDevicesAllowed";
import CardLicensePrice from "./CardLicensePrice";
import CardRegionSelector from "@/components/Cards/CardRegionSelector";
import { regionIcons } from "@/lib/db/licenses/types/enums/RegionEnumIcons";
import CardGenericDropDown from "@/components/Cards/CardGenericDropDown";
import { License } from "@/lib/db/licenses/types/License";
import { MembershipEnum } from "@/lib/enum/MembershipEnum";

interface LicenseType {
  id: number;
  name: string;
}

// Props
interface CardProductLicensesProps {
  fileId: string;
  updateParentLicenses: (licenses: License[]) => void;
  membership: MembershipEnum;
}

export default function CardProductLicenses({
  fileId,
  updateParentLicenses,
  membership = MembershipEnum.Free,
}: CardProductLicensesProps) {
  consoleLog("🔔 ⭐ Client Component Starts (components/products/create/CardProductLicenses.tsx)");

  const icons = regionIcons;
  const regionsAllowed = [
    RegionEnum.Global,
    RegionEnum.UnitedStates,
    RegionEnum.Canada,
    // Add more regions as needed
  ];

  // Initialize regionsAllowed with all the values of RegionEnum
  //const allRegionsAllowed = Object.values(RegionEnum);


  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);

  // Fetch license types from API
  useEffect(() => {
    async function fetchLicenseTypes() {
      try {
        const res = await fetch("/api/licenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operationName: "GetLicenseTypes",
            variables: { clientId: fileId },
          }),
        });
        const data = await res.json();
        const types = (data ?? []).map((t: any) => ({ id: t.id, name: t.name }));
        setLicenseTypes(types);

        // Initialize first license if none
        if (types.length > 0 && licenses.length === 0) {
          setLicenses([{
            price: 0,
            typeId: types[0].id,
            typeName: types[0].name,
            region: RegionEnum.Global,   // Default region
            usersAllowed: 1,             // Default user limit
            devicesAllowed: 1,           // Default device limit
            validPeriod: ValidPeriodEnum.Forever, // Default valid period (enum)
            isMain: true,
          }]);
        }
      } catch (err) {
        console.error("Failed to fetch license types", err);
      }
    }

    fetchLicenseTypes();
  }, [fileId]);

  // Lift licenses to parent
  useEffect(() => {
    updateParentLicenses?.(licenses);
  }, [licenses, updateParentLicenses]);

  // Add license
  const addLicense = () => {
    if (!licenseTypes.length) return;
    const defaultType = licenseTypes[0];
    setLicenses((prev) => [
      ...prev,
      { 
        price: 0,
        typeId: defaultType.id,
        typeName: defaultType.name,
        region: RegionEnum.Global,  // Default region
        usersAllowed: 1,           // Default user limit
        devicesAllowed: 1,         // Default device limit
        validPeriod: ValidPeriodEnum.Forever,  // Default valid period (enum)
        isMain: false,
      },
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
    (index: number, field: keyof License, value: any) => {
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
  const LicenseCard = ({ index, license }: { index: number; license: License }) => (
    <div className="border p-4 my-4 rounded-md shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">
          🔑 License {index + 1} {license.isMain && "(Main)"}
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
        <CardLicensePrice
          cardTitle="💰 License - Price"
          membership = {membership}
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

        {/* Region */}
        <CardRegionSelector
          membership={MembershipEnum.Partner}
          regionIcons={icons}              // Pass the icons for the regions
          setValue={(newRegion) => handleLicenseChange(index, "region", newRegion)}  // Update the region when changed
        />

        {/* Users Allowed */}
        <CardLicenseUsersAllowed
          cardTitle="👥 License - Users per License"
          membership = {membership}
          value={licenses[index].usersAllowed} // initial value
          setValue={(newUsersAllowed) => setLicenses(prev => {
            const updated = [...prev];
            updated[index].usersAllowed = newUsersAllowed; // directly update parent state
            return updated;
          })}
        />

        {/* Devices Allowed */}
        <CardLicenseDevicesAllowed
          cardTitle="🖥️ License - Devices per user"
          membership = {membership}
          value={licenses[index].devicesAllowed} // initial value
          setValue={(newDevicesAllowed) => setLicenses(prev => {
            const updated = [...prev];
            updated[index].devicesAllowed = newDevicesAllowed; // directly update parent state
            return updated;
          })}
        />

        {/* Valid Period */}
        <CardGenericDropDown
            cardTitle="License - Valid Period"
            enumType={ValidPeriodEnum}
            enumArray={Object.values(ValidPeriodEnum)}
            value={licenses[index].validPeriod}
            setValue={(newValidPeriod) => setLicenses(prev => {
            const updated = [...prev];
            updated[index].validPeriod = newValidPeriod; // directly update parent state
            return updated;
          })}
        />
    
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
