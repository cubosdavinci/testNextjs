'use client';

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ProductTitleCard from "@/components/products/create/CardProductTitle";
import SelectCategoryCard from "@/components/products/CardSelectCategory";
import ProductThumbnail from "@/components/products/create/CardProductThumbnail";
import TipTapEditor from "@/components/ui/TipTapEditor";
import ErrorAlert from "@/components/banners/ErrorAlert";
import { consoleLog } from "@/lib/utils";

interface Props {
  productId: string;
}

export default function EditProduct({ productId }: Props) {
  consoleLog("💡 Component Start  -  components/products/EditProduct.ts");

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operationName: "getProduct",
            variables: { productId },
          }),
        });

        const data = await res.json();

        if (!res.ok || !data?.product) {
          setError("Product not found or failed to load.");
        } else {
          const product = data.product;
          setTitle(product.title || "");
          setCategoryId(product.categoryId || null);
          setDescription(product.description || "");
          setCurrentThumbnailUrl(product.thumbnailUrl || null);
        }
      } catch (err: any) {
        setError(err.message || "Unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      formData.append(
        "operations",
        JSON.stringify({
          operationName: "UpdateProduct",
          variables: {
            productId,
            title,
            categoryId,
            description,
            previousThumbnailUrl: currentThumbnailUrl, // for potential deletion
          },
        })
      );

      if (thumbnailFile) {
        formData.append(
          "map",
          JSON.stringify({ "1": ["variables.thumbnailFile"] })
        );
        formData.append("1", thumbnailFile);
      }

      const res = await fetch("/api/supabase/products", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update product");

      alert("Product updated successfully!");
      setCurrentThumbnailUrl(data?.data?.thumbnail_url || currentThumbnailUrl);
      setThumbnailFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading product...</div>;
  if (error) return <ErrorAlert message={error} />;

  consoleLog("💡 Component End  - components/products/EditProduct.ts");
  return (
    <form className="space-y-4 max-w-xl mx-auto p-4" onSubmit={handleSubmit}>
      {/* Product Title */}
      <ProductTitleCard value={title} onChange={setTitle} />

      {/* Category */}
      <SelectCategoryCard
        title="Choose Product Category"
        selectedCategory={categoryId}
        onSelectCategory={setCategoryId}
        returnId
      />

      {/* Thumbnail */}
      <ProductThumbnail
        thumbnailUrl={currentThumbnailUrl || ""}
        onChange={(file) => setThumbnailFile(file)}
      />
      {!currentThumbnailUrl && !thumbnailFile && (
        <ErrorAlert message="No thumbnail image uploaded. Edit to add one." />
      )}

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <TipTapEditor value={description} onChange={setDescription} />
        </CardContent>
      </Card>

      {/* Save Changes */}
      <Card>
        <CardContent>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded w-full"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </CardContent>
      </Card>
    </form>
  );
}
