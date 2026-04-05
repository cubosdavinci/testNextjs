'use client';

import { useState } from "react";
import { consoleLog } from "@/lib/utils";
import CardProductTitle from "@/components/products/create/CardProductTitle";
import CardSelectCategory from "@/components/products/CardSelectCategory";
import CardProductDownloadLink from "@/components/products/create/CardProductDownloadLink";
import CardProductThumbnail from "@/components/products/create/CardProductThumbnail";
import CardProductType from "./CardProductType";
import CardProductVersion from "@/components/products/CardProductVersion";
import CardProductDescription from "./CardProductDescription";
import CardProductLicenses from "@/components/products/create/CardProductLicenses";
import { ProdType } from "@/types/db/products";
import { License } from "@/types/db/licenses";
import { CreateProductVars } from "@/lib/db/products/types/CreateProductVars";
import ErrorAlert from "@/components/banners/ErrorAlert";
import { validateProductTitle } from "@/lib/zod/titleSchema";
import { ZodError } from "zod";
import { validateGoogleDriveLink } from "@/lib/validate/products/validateGoogleDriveLink";

interface Props {
  creatorId: string;
}

export default function CreateProduct({ creatorId }: Props) {
  consoleLog("⚠️ Start components/products/CreateProduct.tsx");
  consoleLog("Creator ID:", creatorId);

  const [title, setTitle] = useState("");
  const [productType, setProductType] = useState<ProdType>(ProdType.ThreeD);
  const [categoryId, setCategoryId] = useState<string | number | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [licenses, setLicenses] = useState<License[]>([]);
  const [downLink, setDownLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // <-- error state

  // -----------------------------
  // Form submit
  // -----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // clear previous errors

    try {
      const variables: CreateProductVars = {
        creatorId,
        title,
        productType,
        slug,
        categoryId,
        description,
        downLink,
        licenses,
        thumbnailFile,
      };

      try {
          validateProductTitle.parse(title);
          validateGoogleDriveLink.parse(downLink)
        } catch (err: unknown) {
          if (err instanceof ZodError) {
            setError(err.issues[0]?.message || "Invalid title");
          } else {
            setError("Unexpected error");
          }
          setLoading(false);
          return
      }

      const formData = new FormData();
      formData.append(
        "operations",
        JSON.stringify({
          operationName: "createProduct",
          variables,
        })
      );

      if (thumbnailFile) {
        formData.append("map", JSON.stringify({ "1": ["variables.thumbnailFile"] }));
        formData.append("1", thumbnailFile);
      }

      const res = await fetch("/api/products", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create product");

      // Redirect to product page
      window.location.href = `/dashboard/products/${data?.data?.id}`;

      // Reset form
      setTitle("");
      setSlug("");
      setCategoryId(null);
      setThumbnailFile(null);
      setDescription("");
      setDownLink("");
      setVersion("");
      setLicenses([]);
    } catch (err: any) {
      // Set error message instead of alert
      setError(err.message || "Unexpected server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4 max-w-xl mx-auto p-4" onSubmit={handleSubmit}>
      <CardProductTitle value={title} onChange={setTitle} />
      <CardProductType selectedProductType={productType} onProductTypeChange={setProductType} />
      <CardSelectCategory
        selectedCategory={categoryId}
        productType={productType}
        onSelectCategory={setCategoryId}
        returnId={true}
      />
      <CardProductDescription value={description} onChange={setDescription} />
      <CardProductDownloadLink value={downLink} onChange={setDownLink} cardTitle="Google Drive Link (source)" />
      <CardProductThumbnail thumbnailUrl={""} onChange={(file) => setThumbnailFile(file)} />
      <CardProductVersion value={version} onChange={setVersion} />
      <CardProductLicenses creatorId={creatorId} onChange={setLicenses} />

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded w-full"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create New Product"}
      </button>

      {/* Show API error below the button */}
      {error && <ErrorAlert message={error} />}
    </form>
  );
}
