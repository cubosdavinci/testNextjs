'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StringEnum = Record<string, string>;

interface CardGenericDropDownProps<T extends StringEnum> {
  cardTitle?: string;

  /** Enum object itself */
  enumType: T;

  /** Allowed enum values */
  enumArray: readonly T[keyof T][];

  /** Selected value */
  value: T[keyof T];

  /** Generic setter */
  setValue?: (value: T[keyof T]) => void;
}

/**
 * CardGenericDropDown
 *
 * A reusable, generic dropdown component for selecting values from any string-based enum.
 * 
 * Props:
 * - cardTitle: Optional title displayed at the top of the card.
 * - enumType: The enum object itself, used for type safety.
 * - enumArray: Array of allowed values to display in the dropdown.
 * - value: Currently selected value (controlled prop).
 * - setValue: Callback to update the parent state when a new value is selected.
 *
 * Features:
 * - Fully generic and type-safe for any string enum.
 * - Displays the selected value in a card-style dropdown.
 * - Automatically synchronizes local state with parent prop `value`.
 * - Handles opening/closing dropdown and updating parent state on selection.
 */
export default function CardGenericDropDown<T extends StringEnum>({
  cardTitle = "Select",
  enumType,
  enumArray,
  value,
  setValue,
}: CardGenericDropDownProps<T>) {
  const [selected, setSelected] = useState<T[keyof T]>(value);
  const [isOpen, setIsOpen] = useState(false);

  // Sync local state if parent value changes
  useEffect(() => {
    setSelected(value);
  }, [value]);

  // Handler to update local and parent state
  const handleSelect = (val: T[keyof T]) => {
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
                {enumArray.map((item) => (
                  <div
                    key={item}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${
                      item === selected ? "bg-gray-100 font-semibold" : ""
                    }`}
                    onClick={() => handleSelect(item)}
                  >
                    {item}
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
