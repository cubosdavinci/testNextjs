"use client";

import { useState } from "react";
import ProductTitleCard from "@/components/products/create/CardProductTitle";
import SelectCategoryCard from "@/components/products/CardSelectCategory";
// import SelectCategoryCard from "@/components/saleor/products/SelectCategoryCard";
import ProductPriceCard from "@/components/saleor/products/ProductPriceCard";
import TipTapEditor from "@/components/ui/TipTapEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  creatorId: string;
}

export default function CreateProduct({ creatorId }: Props) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [price, setPrice] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/supabase/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationName: "CreateProduct",
          variables: {
            creatorId,
            title,
            slug,
            categoryId,
            price,
            thumbnailUrl,
            contentUrl,
            description,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product");

      alert("Product created with ID: " + data?.data?.id);
      // Optionally reset form
      setTitle("");
      setSlug("");
      setCategoryId(null);
      setPrice(0);
      setThumbnailUrl("");
      setContentUrl("");
      setDescription("");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4 max-w-xl mx-auto p-4" onSubmit={handleSubmit}>
      {/* Product Title */}
      <ProductTitleCard value={title} onChange={setTitle} />

      {/* Product Category */}
      <SelectCategoryCard
        title="Choose Product Category"
        selectedSubClass={categoryId}
        onSelectSubClass={setCategoryId}
      />

      {/* Product Price */}
      <ProductPriceCard value={price} onChange={setPrice} />

      {/* Thumbnail URL */}
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

      {/* Content URL */}
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

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <TipTapEditor value={description} onChange={setDescription} />
        </CardContent>
      </Card>

      {/* Submit Button */}
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
