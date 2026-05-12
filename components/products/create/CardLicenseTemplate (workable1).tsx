'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import your new metadata and types
import { 
  LICENSE_TYPE_META, 
  LicenseTypeRow 
} from "@/types/db/licenses/LicenseType";

interface CardLicenseTemplateProps {
  cardTitle?: string;
  licenseTypes: LicenseTypeRow[]; // Use the Row type from Supabase
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
  const [selectedId, setSelectedId] = useState<string | null>(selectedLicenseTypeId);
  const [isOpen, setIsOpen] = useState(false);
  const [showDescription, setShowDescription] = useState(true);

  // Find the selected template from the provided list
  const selectedTemplate = licenseTypes.find((lt) => lt.id === selectedId) ?? null;

  useEffect(() => {
    setSelectedId(selectedLicenseTypeId);
  }, [selectedLicenseTypeId]);

  const handleSelect = (template: LicenseTypeRow) => {
    setSelectedId(template.id);
    setIsOpen(false);
    setShowDescription(true);
    onSelect(template);
  };

  /**
   * Helper to get metadata based on the name from the DB
   * This removes the need for a local iconMap
   */
  const getMeta = (name: string) => {
    return LICENSE_TYPE_META[name] || null;
  };

  return (
    <section id="license-template">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {/* DROPDOWN TRIGGER */}
          <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="w-full border rounded-lg px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  {selectedTemplate ? (
                    <>
                      <img
                        src={getMeta(selectedTemplate.name)?.icon ?? fallbackIcon}
                        alt={selectedTemplate.name}
                        className="w-6 h-6"
                      />
                      <span className="font-medium">{selectedTemplate.name}</span>
                    </>
                  ) : (
                    <>
                      <img
                        src={fallbackIcon}
                        alt="Placeholder"
                        className="w-6 h-6 opacity-30 grayscale"
                      />
                      <span className="text-gray-500">Select license template...</span>
                    </>
                  )}
                </div>
                
                {/* CUSTOM SVG CHEVRONS */}
                <img 
                  src={isOpen ? "/icons/ui/chevron-up.svg" : "/icons/ui/chevron-down.svg"} 
                  alt="toggle" 
                  className="w-4 h-4 opacity-50"
                />
            </button>

            {/* OPTIONS MENU */}
            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-white border rounded-lg shadow-lg overflow-hidden max-h-80 overflow-y-auto">
                {licenseTypes
                  .sort((a, b) => a.ui_order - b.ui_order) // Keep DB order
                  .map((template) => {
                    const meta = getMeta(template.name);
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => handleSelect(template)}
                        className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-100 transition text-left border-b last:border-b-0"
                      >
                        <img
                          src={meta?.icon ?? fallbackIcon}
                          alt={template.name}
                          className="w-6 h-6 mt-0.5 shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{template.name}</span>
                          <span className="text-xs text-gray-500 line-clamp-1">
                            {template.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                {allowCustom && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(null);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 border-t text-left hover:bg-gray-100 transition text-blue-600 font-medium"
                  >
                    + Use Custom License
                  </button>
                )}
              </div>
            )}
          </div>

          {/* EXPANDABLE DESCRIPTION BOX */}
          {selectedTemplate && (
            <div className="border rounded-lg bg-gray-50 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setShowDescription((prev) => !prev)}
                  className="w-full flex items-center justify-between"
                >
                  <span className="font-medium text-sm">License Details</span>
                  
                  {/* CUSTOM SVG CHEVRONS */}
                  <img 
                    src={showDescription ? "/icons/ui/chevron-up.svg" : "/icons/ui/chevron-down.svg"} 
                    alt="toggle description" 
                    className="w-4 h-4 opacity-70"
                  />
                </button>

                {showDescription && (
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                    {selectedTemplate.description || "No description provided."}
                  </p>
                )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}