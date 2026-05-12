'use client';

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LICENSE_TYPE_META, LicenseTypeRow } from "@/types/db/licenses/LicenseType";

interface CardLicenseTemplateProps {
  cardTitle?: string;
  licenseTypes: LicenseTypeRow[];
  selectedLicenseTypeId?: string | null;
  onSelect: (licenseType: LicenseTypeRow) => void;
  allowCustom?: boolean;
}

const fallbackIcon = "/icons/license-type/personal.svg";

export default function CardLicenseTemplate({
  cardTitle = "License Template",
  licenseTypes,
  selectedLicenseTypeId = null,
  onSelect,
  allowCustom = true,
}: CardLicenseTemplateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDescription, setShowDescription] = useState(true);

  /**
   * Resolve selected template (ProductType style)
   */
  const selectedId =
    selectedLicenseTypeId ?? licenseTypes?.[0]?.id ?? null;

  const selectedTemplate = useMemo(() => {
    return (
      licenseTypes.find((lt) => lt.id === selectedId) ??
      licenseTypes[0] ??
      null
    );
  }, [licenseTypes, selectedId]);

  const getMeta = (name: string) =>
    LICENSE_TYPE_META[name] || null;

  const handleSelect = (template: LicenseTypeRow) => {
    onSelect(template);
    setIsOpen(false);
    setShowDescription(true);
  };

  if (!selectedTemplate) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            No license types available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section id="license-template">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">

          {/* DROPDOWN */}
          <div className="relative">

            {/* TRIGGER */}
            <button
              type="button"
              onClick={() => setIsOpen((p) => !p)}
              className="
                w-full border rounded-lg px-4 py-3
                flex items-center justify-between
                hover:bg-gray-50 transition
              "
            >
              <div className="flex items-center gap-3 min-w-0">

                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <img
                    src={
                      getMeta(selectedTemplate.name)?.icon ??
                      fallbackIcon
                    }
                    alt={selectedTemplate.name}
                    className="w-20 h-20 block"
                  />
                </div>

                <span className="font-medium truncate">
                  {selectedTemplate.name}
                </span>

              </div>

              <img
                src={
                  isOpen
                    ? "/icons/ui/chevron-up.svg"
                    : "/icons/ui/chevron-down.svg"
                }
                alt="toggle"
                className="w-4 h-4 opacity-50 shrink-0"
              />
            </button>

            {/* OPTIONS */}
            {isOpen && (
              <div className="
                absolute top-full left-0 right-0 mt-2 z-20
                bg-white border rounded-lg shadow-lg
                max-h-80 overflow-y-auto
              ">
                {licenseTypes
                  .sort((a, b) => a.ui_order - b.ui_order)
                  .map((template) => {
                    const meta = getMeta(template.name);

                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => handleSelect(template)}
                        className="
                          w-full px-4 py-3
                          flex items-center gap-3
                          hover:bg-gray-100 transition
                          text-left border-b last:border-b-0
                        "
                      >
                        {/* ICON */}
                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                          <img
                            src={meta?.icon ?? fallbackIcon}
                            alt={template.name}
                            className="w-7 h-7 block"
                          />
                        </div>

                        {/* TEXT */}
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">
                            {template.name}
                          </span>
                          <span className="text-xs text-gray-500 truncate">
                            {template.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                {allowCustom && (
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="
                      w-full px-4 py-3 border-t
                      text-left hover:bg-gray-100
                      text-blue-600 font-medium
                    "
                  >
                    + Use Custom License
                  </button>
                )}
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="border rounded-lg bg-gray-50 px-4 py-3">

            <button
              type="button"
              onClick={() => setShowDescription((p) => !p)}
              className="w-full flex items-center justify-between"
            >
              <span className="font-medium text-sm">
                License Details
              </span>

              <img
                src={
                  showDescription
                    ? "/icons/ui/chevron-up.svg"
                    : "/icons/ui/chevron-down.svg"
                }
                alt="toggle"
                className="w-4 h-4 opacity-70 shrink-0"
              />
            </button>

            {showDescription && (
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                {selectedTemplate.description ||
                  "No description provided."}
              </p>
            )}

          </div>

        </CardContent>
      </Card>
    </section>
  );
}