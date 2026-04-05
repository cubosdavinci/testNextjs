"use client";

import  {productTitleSchema} from "@/lib/validate/products/validateProducts"
import ProductTitleCard from "@/components/products/create/CardProductTitle";

import TipTapEditor from "@/components/ui/TipTapEditor";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Import Shadcn components
import SelectCategoryCard from "@/components/saleor/products/SelectCategoryCard";
import ProductPriceCard from "@/components/saleor/products/ProductPriceCard";

export default function CreateSingleDigitalPage() {
  const [subClassCat, setSubClassCat] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [description, setDescription] = useState(""); // JSONString
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/products/create-single-digital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          subClassCat,
          price,
          thumbnailUrl,
          contentUrl,
          description, // JSONString
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product");

      alert("Product created with ID: " + data.productId);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4 max-w-xl mx-auto p-4" onSubmit={handleSubmit}>
      {/* Title Card */}
      <ProductTitleCard value={title} onChange={setTitle} />

      {/* Product Category Card */}
      <SelectCategoryCard
        title="Choose Product Category"
        selectedSubClass={subClassCat}
        onSelectSubClass={setSubClassCat}
      />

      {/* Product Price */}
      <ProductPriceCard value={price} onChange={setPrice} />

      {/* Thumbnail URL Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thumbnail URL</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="text"
            placeholder="Thumbnail URL"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </CardContent>
      </Card>

      {/* Content URL Card */}
      <Card>
        <CardHeader>
          <CardTitle>Digital Content URL</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="text"
            placeholder="Digital Content URL"
            value={contentUrl}
            onChange={(e) => setContentUrl(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </CardContent>
      </Card>

      {/* Description Card with TipTap Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <TipTapEditor />
        </CardContent>
      </Card>

      {/* Submit Button Card */}
      <Card>
        <CardContent>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded w-full"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </CardContent>
      </Card>
    </form>
  );
}
