'use client';

import { useEffect, useState } from "react";
import { consoleLog } from "@/lib/utils";
import CardProductTitle from "@/components/products/create/CardProductTitle";
import CardSelectCategory from "@/components/products/CardSelectCategory";
import CardProductThumbnail from "@/components/products/create/CardProductThumbnail";
import CardProductType from "./create/CardProductType";
import CardProductVersion from "@/components/products/CardProductVersion";
import CardProductDescription from "./create/CardProductDescription";
import CardProductLicenses from "@/components/products/create/CardProductLicenses";
import { ProdType, Product, ProdStatus } from "@/types/db/products";
import { License } from "@/types/db/licenses";
import { CreateProductVars } from "@/types/db/products";
import ErrorAlert from "@/components/banners/ErrorAlert";

interface Props {
  productId: string;
}

export default function EditProduct({ productId }: Props) {
  consoleLog("💡 Component Start - components/products/EditProduct.tsx");

  const [product, setProduct] = useState<Product | null>(null);
  const [title, setTitle] = useState("");
  const [productType, setProductType] = useState<ProdType>(ProdType.ThreeD);
  const [categoryId, setCategoryId] = useState<string | number | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState<string | null>(null);
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------
  // Load product data
  // -----------------------------
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
          const fetchedProduct: Product = data.product;
          setProduct(fetchedProduct);

          // Initialize form fields
          setTitle(fetchedProduct.title || "");
          setProductType(fetchedProduct.type);
          setCategoryId(fetchedProduct.categoryId || null);
          setDescription(fetchedProduct.description || "");
          setCurrentThumbnailUrl(fetchedProduct.thumbnailUrl || null);
          setVersion(fetchedProduct.version?.toString() || "");
          setLicenses(
            fetchedProduct.files?.map((f) => f.License).filter(Boolean) || []
          );
        }
      } catch (err: any) {
        setError(err.message || "Unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  // -----------------------------
  // Form submit
  // -----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setLoading(true);
    setError(null);

    try {
      const variables: CreateProductVars = {
        creatorId: product.creatorId,
        title,
        productType,
        slug: product.id, // assuming product.id as slug for edit
        categoryId,
        description,
        licenses,
      };

      const formData = new FormData();
      formData.append(
        "operations",
        JSON.stringify({
          operationName: "updateProduct",
          variables: {
            ...variables,
            previousThumbnailUrl: currentThumbnailUrl,
          },
        })
      );

      if (thumbnailFile) {
        formData.append("map", JSON.stringify({ "1": ["variables.thumbnailFile"] }));
        formData.append("1", thumbnailFile);
      }

      const res = await fetch("/api/products", { method: "POST", body: formData });
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

  consoleLog("💡 Component End - components/products/EditProduct.tsx");

  return (
    <form className="space-y-4 max-w-xl mx-auto p-4" onSubmit={handleSubmit}>
      <CardProductTitle value={title} onChange={setTitle} />
      <CardProductType selectedProductType={productType} onProductTypeChange={setProductType} />
      <CardSelectCategory
        selectedCategory={categoryId}
        productType={productType}
        onSelectCategory={setCategoryId}
        returnId
      />
      <CardProductThumbnail
        thumbnailUrl={currentThumbnailUrl || ""}
        onChange={(file) => setThumbnailFile(file)}
      />
      <CardProductVersion value={version} onChange={setVersion} />
      <CardProductDescription value={description} onChange={setDescription} />

      {/* Licenses */}
      <CardProductLicenses creatorId={product.creatorId} onChange={setLicenses} initialLicenses={licenses} />

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded w-full"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
