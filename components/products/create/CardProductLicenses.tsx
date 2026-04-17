'use client';

import { useState, useEffect, useCallback } from "react";
import { browserConsoleLog, consoleLog } from "@/lib/utils";
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
  id: string;
  name: string;
  description?: string;
}

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
  consoleLog("🔔 ⭐ Client Component Starts (CardProductLicenses)");

  const icons = regionIcons;

  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);

  useEffect(() => {
    async function fetchLicenseTypes() {
      try {
        browserConsoleLog("Fetching License Types");

        const res = await fetch("/api/supabase/licenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operationName: "GetLicenseTypes",
            variables: { clientId: fileId },
          }),
        });

        const data = await res.json();

        const types = (data ?? []).map((t: any) => ({
          id: t.id,
          name: t.name,
          description: t.description,
        }));

        setLicenseTypes(types);

        if (types.length > 0 && licenses.length === 0) {
          setLicenses([
            {
              price: 0,
              typeId: types[0].id,
              typeName: types[0].name,
              region: RegionEnum.Global,
              usersAllowed: 1,
              devicesAllowed: 1,
              validPeriod: ValidPeriodEnum.Forever,
              isMain: true,
            },
          ]);
        }
      } catch (err) {
        console.error("Error Fetching License Types", err);
      }
    }

    fetchLicenseTypes();
  }, [fileId]);

  useEffect(() => {
    updateParentLicenses?.(licenses);
  }, [licenses, updateParentLicenses]);

  const addLicense = () => {
    if (!licenseTypes.length) return;

    const defaultType = licenseTypes[0];

    setLicenses((prev) => [
      ...prev,
      {
        price: 0,
        typeId: defaultType.id,
        typeName: defaultType.name,
        region: RegionEnum.Global,
        usersAllowed: 1,
        devicesAllowed: 1,
        validPeriod: ValidPeriodEnum.Forever,
        isMain: false,
      },
    ]);
  };

  const removeLicense = (index: number) => {
    setLicenses((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length && !updated.some((l) => l.isMain)) {
        updated[0].isMain = true;
      }
      return updated;
    });
  };

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

  // =========================
  // LICENSE CARD COMPONENT
  // =========================
  const LicenseCard = ({
    index,
    license,
  }: {
    index: number;
    license: License;
  }) => {
    const [open, setOpen] = useState(false);

    return (
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
          {/* PRICE */}
          <CardLicensePrice
            cardTitle="💰 License - Price"
            membership={membership}
            value={license.price}
            setValue={(newPrice) =>
              setLicenses((prev) => {
                const updated = [...prev];
                updated[index].price = newPrice;
                return updated;
              })
            }
          />

          {/* LICENSE TYPE */}
          <div className="relative">
            <label className="block font-medium mb-1">
              License Type
            </label>

            <div className="flex items-center gap-2">
              <select
                value={license.typeId}
                className="border p-2 rounded w-full"
                onChange={(e) => {
                  const typeId = e.target.value;
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

              <button
                type="button"
                className="w-9 h-9 flex items-center justify-center rounded border hover:bg-gray-100 transition"
                onClick={() => setOpen((v) => !v)}
                title="View description"
              >
                ℹ️
              </button>
            </div>

            {open && (
              <div className="absolute z-10 mt-2 w-full bg-white border shadow-lg rounded p-3 text-sm">
                {licenseTypes.find(
                  (t) => t.id === license.typeId
                )?.description ?? "No description available."}

                <div className="text-right mt-2">
                  <button
                    className="text-blue-500 text-xs"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* REGION */}
          <CardRegionSelector
            membership={MembershipEnum.Partner}
            regionIcons={icons}
            setValue={(newRegion) =>
              handleLicenseChange(index, "region", newRegion)
            }
          />

          {/* USERS */}
          <CardLicenseUsersAllowed
            cardTitle="👥 Users per License"
            membership={membership}
            value={license.usersAllowed}
            setValue={(val) =>
              setLicenses((prev) => {
                const updated = [...prev];
                updated[index].usersAllowed = val;
                return updated;
              })
            }
          />

          {/* DEVICES */}
          <CardLicenseDevicesAllowed
            cardTitle="🖥️ Devices per user"
            membership={membership}
            value={license.devicesAllowed}
            setValue={(val) =>
              setLicenses((prev) => {
                const updated = [...prev];
                updated[index].devicesAllowed = val;
                return updated;
              })
            }
          />

          {/* VALID PERIOD */}
          <CardGenericDropDown
            cardTitle="License - Valid Period"
            enumType={ValidPeriodEnum}
            enumArray={Object.values(ValidPeriodEnum)}
            value={license.validPeriod}
            setValue={(val) =>
              setLicenses((prev) => {
                const updated = [...prev];
                updated[index].validPeriod = val;
                return updated;
              })
            }
          />

          {/* MAIN */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1">
              <input
                type="radio"
                checked={license.isMain}
                onChange={() =>
                  handleLicenseChange(index, "isMain", true)
                }
                className="accent-blue-600"
              />
              <span>Main License</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="product-licenses" className="space-y-2">
      {licenses.map((license, index) => (
        <LicenseCard
          key={index}
          index={index}
          license={license}
        />
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