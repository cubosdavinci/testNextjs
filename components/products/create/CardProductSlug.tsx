'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateSafeSlug } from "@/lib/db/products/helpers/generateSafeSlug";

interface ProductSlugCardProps {
  cardTitle?: string;
  title: string; // Product title from parent
  value?: string;
  onChange?: (value: string) => void; // Optional if you want to lift slug to parent
}

export default function CardProductSlug({
  cardTitle = "Product Slug (generated from title)",
  title,
  value = "",
  onChange,
}: ProductSlugCardProps) {
  const [slug, setSlug] = useState(value);

  // Generate slug whenever title changes
  useEffect(() => {
    const generatedSlug = generateSafeSlug(title).slice(0, 100);
    setSlug(generatedSlug);

    // Optionally lift slug to parent
    if (onChange) {
      onChange(generatedSlug);
    }
  }, [title, onChange]);

  return (
    <section id="product-slug">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <input
            type="text"
            value={slug}
            readOnly
            className="border p-2 rounded w-full bg-gray-100 text-gray-700 cursor-not-allowed"
          />
        </CardContent>
      </Card>
    </section>
  );
}
