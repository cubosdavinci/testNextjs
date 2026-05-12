'use client';

import { useState, useEffect } from "react";
import { MembershipEnum } from "@/lib/enum/MembershipEnum";
import { ProductLicenseClientInput } from "@/lib/supabase/types";

import CardLicenseUsersAllowed from "./CardLicenseUsersAllowed";
import CardLicenseDevicesAllowed from "./CardLicenseDevicesAllowed";
import CardLicensePrice from "./CardLicensePrice";
import CardGenericDropDown from "@/components/Cards/CardGenericDropDown";

import {
  LICENSE_DURATION_OPTIONS,
  LicenseDuration,
} from "types/db/product-licenses/LicenseDuration";

import { supabaseBrowser } from "@/lib/supabase/clients/supabaseBrowser";

interface LicenseType {
  id: string;
  name: string;
  description?: string | null;
}

interface CardProductLicensesProps {
  productId: string;
  updateParentLicenses: (licenses: ProductLicenseClientInput[]) => void;
  membership: MembershipEnum;
}

function createDefaultLicense(productId: string): ProductLicenseClientInput {
  return {
    product_id: productId,
    name: "Default License",
    description: "",
    base_price_cents: 0,
    max_license_users: 1,
    max_user_devices: 1,
    license_duration: "Forever",
    is_main: true,
    sort_order: 0,
  };
}

export default function CardProductLicenses({
  productId,
  updateParentLicenses,
  membership = MembershipEnum.Free,
}: CardProductLicensesProps) {
  const [licenses, setLicenses] = useState<ProductLicenseClientInput[]>(
    () => [createDefaultLicense(productId)]
  );

  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);

  // =========================
  // FETCH LICENSE TYPES (TEMPLATES)
  // =========================
  useEffect(() => {
    const fetchLicenseTypes = async () => {

      const supabase = supabaseBrowser();

      const { data, error } = await supabase
        .from("license_types")
        .select("id, name, description")
        .order("name");

      if (error) {
        console.error("Error fetching license types", error);
        return;
      }

      setLicenseTypes(data ?? []);
    };

    fetchLicenseTypes();
  }, []);

  // =========================
  // RESET ON PRODUCT CHANGE
  // =========================
  useEffect(() => {
    setLicenses([createDefaultLicense(productId)]);
  }, [productId]);

  // =========================
  // SYNC WITH PARENT
  // =========================
  useEffect(() => {
    updateParentLicenses(licenses);
  }, [licenses, updateParentLicenses]);

  // =========================
  // HELPERS
  // =========================
  const updateField = <K extends keyof ProductLicenseClientInput>(
    index: number,
    field: K,
    value: ProductLicenseClientInput[K]
  ) => {
    setLicenses((prev) =>
      prev.map((l, i) =>
        i === index ? { ...l, [field]: value } : l
      )
    );
  };

  const setMain = (index: number) => {
    setLicenses((prev) =>
      prev.map((l, i) => ({
        ...l,
        is_main: i === index,
      }))
    );
  };

  const addLicense = () => {
    setLicenses((prev) => [
      ...prev,
      {
        product_id: productId,
        name: "",
        description: "",
        base_price_cents: 0,
        max_license_users: 1,
        max_user_devices: 1,
        license_duration: "Forever",
        is_main: false,
        sort_order: prev.length,
      },
    ]);
  };

  const removeLicense = (index: number) => {
    setLicenses((prev) => {
      const updated = prev.filter((_, i) => i !== index);

      if (updated.length && !updated.some((l) => l.is_main)) {
        updated[0] = { ...updated[0], is_main: true };
      }

      return updated;
    });
  };

  // =========================
  // APPLY TEMPLATE
  // =========================
  const applyTemplate = (index: number, templateId: string) => {
    const template = licenseTypes.find((t) => t.id === templateId);
    if (!template) return;

    setLicenses((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l;

        return {
          ...l,
          name: l.name || template.name,
          description: l.description || template.description || "",
        };
      })
    );
  };

  // =========================
  // CARD
  // =========================
  const LicenseCard = ({
    index,
    license,
  }: {
    index: number;
    license: ProductLicenseClientInput;
  }) => {
    return (
      <div className="border p-4 my-4 rounded-md shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">
            🔑 License {index + 1} {license.is_main && "(Main)"}
          </h3>

          {!license.is_main && (
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

          {/* TEMPLATE SELECTOR */}
          {licenseTypes.length > 0 && (
            <div>
              <label className="block font-medium mb-1">
                License Template
              </label>
              <select
                className="border p-2 rounded w-full"
                onChange={(e) =>
                  applyTemplate(index, e.target.value)
                }
              >
                <option value="">Select template...</option>
                {licenseTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* NAME */}
          <div>
            <label className="block font-medium mb-1">
              License Name
            </label>
            <input
              value={license.name}
              onChange={(e) =>
                updateField(index, "name", e.target.value)
              }
              className="border p-2 rounded w-full"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block font-medium mb-1">
              Description
            </label>
            <textarea
              value={license.description ?? ""}
              onChange={(e) =>
                updateField(index, "description", e.target.value)
              }
              className="border p-2 rounded w-full"
            />
          </div>

          {/* PRICE */}
          <CardLicensePrice
            cardTitle="💰 License Price"
            membership={membership}
            value={license.base_price_cents ?? 0}
            setValue={(val) =>
              updateField(index, "base_price_cents", val)
            }
          />

          {/* USERS */}
          <CardLicenseUsersAllowed
            cardTitle="👥 Users per License"
            membership={membership}
            value={license.max_license_users}
            setValue={(val) =>
              updateField(index, "max_license_users", val)
            }
          />

          {/* DEVICES */}
          <CardLicenseDevicesAllowed
            cardTitle="🖥️ Devices per User"
            membership={membership}
            value={license.max_user_devices}
            setValue={(val) =>
              updateField(index, "max_user_devices", val)
            }
          />

          {/* DURATION */}
          <CardGenericDropDown
            cardTitle="License Duration"
            options={LICENSE_DURATION_OPTIONS}
            value={license.license_duration}
            setValue={(val: LicenseDuration) =>
              updateField(index, "license_duration", val)
            }
          />

          {/* MAIN */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1">
              <input
                type="radio"
                checked={license.is_main}
                onChange={() => setMain(index)}
                className="accent-blue-600"
              />
              <span>Main License</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  // =========================
  // RENDER
  // =========================
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