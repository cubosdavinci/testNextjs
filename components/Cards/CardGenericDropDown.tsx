'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Generic option shape (NEW standard)
 */
export type DropdownOption<T = string> = {
  label: string;
  value: T;
};

interface CardGenericDropDownProps<T extends string> {
  cardTitle?: string;

  /**
   * NEW: preferred API
   */
  options?: DropdownOption<T>[];

  /**
   * LEGACY support (enum-style)
   */
  enumArray?: readonly T[];

  /**
   * Selected value
   */
  value: T;

  /**
   * Setter
   */
  setValue?: (value: T) => void;
}

export default function CardGenericDropDown<T extends string>({
  cardTitle = "Select",
  options,
  enumArray,
  value,
  setValue,
}: CardGenericDropDownProps<T>) {
  const [selected, setSelected] = useState<T>(value);
  const [isOpen, setIsOpen] = useState(false);

  // Sync with parent
  useEffect(() => {
    setSelected(value);
  }, [value]);

  /**
   * Normalize input into a single format
   */
  const normalizedOptions: DropdownOption<T>[] =
    options ??
    (enumArray?.map((v) => ({
      label: String(v),
      value: v,
    })) as DropdownOption<T>[]) ??
    [];

  const handleSelect = (val: T) => {
    setSelected(val);
    setValue?.(val);
    setIsOpen(false);
  };

  return (
    <section>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-2">
          <div
            className="relative border p-2 rounded cursor-pointer"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <div className="flex justify-between items-center">
              <span>{selected}</span>
              <span className="text-gray-500">▼</span>
            </div>

            {isOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border rounded mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
                {normalizedOptions.map((item) => (
                  <div
                    key={item.value}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${item.value === selected
                        ? "bg-gray-100 font-semibold"
                        : ""
                      }`}
                    onClick={() => handleSelect(item.value)}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}