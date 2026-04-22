// components/products/create/CreateProduct.tsx
'use client';

import { useCallback, useState } from "react";

// Helpers
import { consoleLog } from "@/lib/utils";

// Types
import { PRODUCT_TYPE, ProductType } from "@/types/db/products/ProductType";
import type { CreateProductFileInput, CreateProductInput, CreateProductLicenseInput } from "@/lib/supabase/types";

// Cards
import CardGenericTitle from "@/components/Cards/CardGenericTitle";
import CardSelectCategory from "@/components/products/CardSelectCategory";
import CardProductThumbnail from "@/components/products/create/CardProductThumbnail";
import CardProductType from "./CardProductType";
import CardProductVersion from "@/components/products/CardProductVersion";
import CardProductDescription from "./CardProductDescription";
import CardProductLicenses from "@/components/products/create/CardProductLicenses";
import CardProductSlug from "./CardProductSlug";
import CardGoogleDriveFile from "./CardGoogleDriveFile";

// Banners
import ErrorAlert from "@/components/banners/ErrorAlert";

// Validation
import { titleSchema } from "@/lib/zod/titleSchema";
import { validateGoogleDriveLink } from "@/lib/validate/products/validateGoogleDriveLink";
import { ZodError, file } from "zod";

interface Props {
  creatorId: string;
}

export default function CreateProduct({ creatorId }: Props) {
  consoleLog("🔔 ⭐ Client Component Starts (CreateProduct)");
  consoleLog("🔍 Creator ID:", creatorId);

  const [title, setTitle] = useState("");
  const [productType, setProductType] = useState<ProductType>(PRODUCT_TYPE.Image);
  const [categoryId, setCategoryId] = useState<string | number | null>(null);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");

  const [licenses, setLicenses] = useState<CreateProductLicenseInput[]>([]);
  const [files, setFiles] = useState<CreateProductFileInput[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLicensesChange = useCallback((updated: CreateProductLicenseInput[]) => {
    setLicenses(updated);
  }, []);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    // Validation
    titleSchema(1, 50).parse(title);

    const product: CreateProductInput = {
      title,
      description,
      type: productType,
      category_id: categoryId != null ? Number(categoryId) : undefined,
      version,
      only_for_followers: false,
      tags: [],
      user_tags: [],
    };

    const productFiles = files;
    const productLicenses = licenses;

    const formData = new FormData();

    formData.append("newProduct", JSON.stringify(product));
    formData.append("newProductFiles", JSON.stringify(productFiles));
    formData.append("newProductLicenses", JSON.stringify(productLicenses));

    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    const res = await fetch("/api/supabase/product/create", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok || !data?.data?.id) {
      throw new Error(data?.error || "Failed to create product");
    }

    window.location.href = `/dashboard/products/${data.data.id}`;

  } catch (err) {
    const error = err as Error;

    setError(error.message || "Unexpected server error");
  } finally {
    setLoading(false);
  }
};

  return (
    <section id="create-new-product-form" className="space-y-2">
      <form
        className="space-y-4 max-w-xl mx-auto p-4"
        onSubmit={handleSubmit}
      >

        <CardGenericTitle
          cardTitle="🏷️ Title"
          value={title}
          setValue={setTitle}
          minChars={5}
        />

        <CardProductSlug title={title} onChange={setSlug} />

        <CardProductType
          selectedProductType={productType}
          onProductTypeChange={setProductType}
        />

        <CardSelectCategory
          selectedCategory={categoryId}
          productType={productType}
          onSelectCategory={setCategoryId}
          returnId={true}
        />

        <CardProductDescription
          cardTitle="📝 Description"
          value={description}
          setValue={setDescription}
        />

        {/* NEW: FILES SYSTEM */}
        <CardGoogleDriveFile
          title="Google Drive (Files)"
          metadataJson
          value={files}
          onChange={setFiles}
        />

        <CardProductVersion
          cardTitle="#️⃣ Version"
          value={version}
          onChange={setVersion}
        />

        <CardProductLicenses
          fileId={creatorId}
          updateParentLicenses={handleLicensesChange}
        />

        <CardProductThumbnail
          thumbnailUrl={""}
          onChange={setThumbnailFile}
          maxSize={150 * 1024}
        />

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded w-full"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create New Product"}
        </button>

        {error && (
          <ErrorAlert message={error} onClose={() => setError(null)} />
        )}
      </form>
    </section>
  );
}