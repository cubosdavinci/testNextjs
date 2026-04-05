'use client';

import { useCallback, useState } from "react";
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
import CardProductSlug from "./CardProductSlug";
import { NewProductLicense } from "@/lib/db/products/types/NewProductLicense";

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
  const [error, setError] = useState<string | null>(null);
  
  const handleLicensesChange = useCallback((updatedLicenses: NewProductLicense[]) => {
    setLicenses(updatedLicenses);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const variables: CreateProductVars = {
        creatorId,
        title,
        productType,
        slug,
        categoryId: categoryId != null ? Number(categoryId) : null, // force number or null
        description,
        downLink,
        licenses,
        //thumbnailUrl // placeholder for GraphQL multipart spec
      };

      // Local validation
      try {
        validateProductTitle.parse(title);
        validateGoogleDriveLink.parse(downLink);
      } catch (err) {
        if (err instanceof ZodError) {
          setError(err.issues[0]?.message || "Invalid input");
        } else {
          setError("Unexpected error");
        }
        setLoading(false);
        return;
      }

      const formData = new FormData();

      // Always include operations
      formData.append(
        "operations",
        JSON.stringify({
          operationName: "createProduct",
          variables,
        })
      );

      // Conditional map
      if (thumbnailFile) {
        formData.append(
          "map",
          JSON.stringify({
            "0": ["variables.thumbnailFile"],
          })
        );

        formData.append("0", thumbnailFile);
      } else {
        // Prevent server crash — include empty map
        formData.append("map", JSON.stringify({}));
      }

      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data?.data?.id) {
        throw new Error(data?.error || "Failed to create product");
      }

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
      setError(err.message || "Unexpected server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4 max-w-xl mx-auto p-4" onSubmit={handleSubmit}>
      <CardProductTitle value={title} onChange={setTitle} />
      <CardProductSlug title={title} onChange={setSlug} />
      <CardProductType selectedProductType={productType} onProductTypeChange={setProductType} />
      <CardSelectCategory
        selectedCategory={categoryId}
        productType={productType}
        onSelectCategory={setCategoryId}
        returnId={true}
      />
      <CardProductDescription
  value={description}
  setValue={(newDescription) =>
    setDescription(newDescription)
  }
/>
      <CardProductDownloadLink value={downLink} onChange={setDownLink} cardTitle="Google Drive Link (source)" />
      <CardProductThumbnail thumbnailUrl={""} onChange={(file) => setThumbnailFile(file)} />
      <CardProductVersion value={version} onChange={setVersion} />
      <CardProductLicenses creatorId={creatorId} onChange={handleLicensesChange} />

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded w-full"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create New Product"}
      </button>

      {error && <ErrorAlert message={error} />}
    </form>
  );
}
