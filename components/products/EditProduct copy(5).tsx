'use client';

import { useEffect, useState } from "react";
import { Product, ProductLicense } from "@/types/db/products";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ProductTitleCard from "@/components/products/create/CardProductTitle";
import SelectCategoryCard from "@/components/products/CardSelectCategory";
import ProductThumbnail from "@/components/products/create/CardProductThumbnail";
import TipTapEditor from "@/components/ui/TipTapEditor";

interface EditProductProps {
  id: string;
  clientId: string;
}

export default function EditProduct({ id, clientId }: EditProductProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [licenses, setLicenses] = useState<ProductLicense[]>([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch("/api/supabase/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationName: "GetProduct",
          variables: { productId: id, clientId },
        }),
      });
      const data = await res.json();
      if (res.ok && data?.data) {
        setProduct(data.data);
        setLicenses(data.data.licenses ?? []);
        setTitle(data.data.name);
        setCategoryId(data.data.categoryId);
        setDescription(data.data.description ?? "");
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id, clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Call your update route
    // Example: UpdateProduct({ id, title, categoryId, description, licenses, thumbnailFile })
    alert("Saving not implemented yet!");
  };

  if (loading) return <div>Loading product...</div>;
  if (!product) return <div>Product not found.</div>;

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <ProductTitleCard value={title} onChange={setTitle} />
      <SelectCategoryCard
        title="Choose Product Category"
        selectedCategory={categoryId}
        onSelectCategory={setCategoryId}
        returnId
      />
      <ProductThumbnail thumbnailUrl={product.thumbnailUrl || ""} onChange={setThumbnailFile} />
      <Card>
        <CardHeader><CardTitle>Description</CardTitle></CardHeader>
        <CardContent>
          <TipTapEditor value={description} onChange={setDescription} />
        </CardContent>
      </Card>
      {/* You can map licenses here similar to CreateProduct */}
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        Save Changes
      </button>
    </form>
  );
}
