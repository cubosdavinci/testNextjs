'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TipTapEditor from "@/components/ui/TipTapEditor";
import { consoleLog } from "@/lib/utils";

interface ProductDescriptionCardProps {
  cardTitle?: string;
  value?: string;
  setValue?: (value: string) => void; // parent setter
}

export default function CardProductDescription({
  cardTitle = "Product Description",
  value = "",
  setValue,
}: ProductDescriptionCardProps) {
  const [description, setDescription] = useState(value);

  // Sync local state if parent value changes
  useEffect(() => {
    setDescription(value);
  }, [value]);

  // Forward blur event to parent
  const handleBlur = (html: string) => {
    consoleLog("onBlur Description triggered");
    if (setValue) setValue(html);
  };

  return (
    <section id="product-description">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-2">
          <TipTapEditor
            value={description}
            onChange={setDescription}
            onBlur={handleBlur}
            max={300} // optional maximum characters
          />
        </CardContent>
      </Card>
    </section>
  );
}
