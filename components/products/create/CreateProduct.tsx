'use client';

import { useCallback, useState } from "react";
// Helpers
import { consoleLog } from "@/lib/utils";
// Types
import { ProductType } from "@/types/enums/ProductType";
import { License } from "@/lib/db/licenses/types/License"
import { CreateProductVars } from "@/lib/db/products/types/CreateProductVars";
// Cards
import CardProductTitle from "@/components/products/create/CardProductTitle";
import CardSelectCategory from "@/components/products/CardSelectCategory";
import CardProductDownloadLink from "@/components/products/create/CardProductDownloadLink";
import CardProductThumbnail from "@/components/products/create/CardProductThumbnail";
import CardProductType from "./CardProductType";
import CardProductVersion from "@/components/products/CardProductVersion";
import CardProductDescription from "./CardProductDescription";
import CardProductLicenses from "@/components/products/create/CardProductLicenses";
import CardProductSlug from "./CardProductSlug";
// Banners
import ErrorAlert from "@/components/banners/ErrorAlert";
import { titleSchema } from "@/lib/zod/titleSchema";
// Zod
import { ZodError } from "zod";
import { validateGoogleDriveLink } from "@/lib/validate/products/validateGoogleDriveLink";
import CardGenericTitle from "@/components/Cards/CardGenericTitle";



interface Props {
  creatorId: string;
}

export default function CreateProduct({ creatorId }: Props) {
  consoleLog("🔔 ⭐ Client Component Starts (components/products/CreateProduct.tsx)");
  consoleLog("🔍 Creator ID:", creatorId);

  const [title, setTitle] = useState("");
  const [productType, setProductType] = useState<ProductType>(ProductType.Image);
  const [categoryId, setCategoryId] = useState<string | number | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [licenses, setLicenses] = useState<License[]>([]);
  const [downLink, setDownLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleLicensesChange = useCallback((updatedLicenses: License[]) => {
    setLicenses(updatedLicenses);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const variables: CreateProductVars = {
        title,
        type: productType,
        slug,
        categoryId: categoryId != null ? Number(categoryId) : null, // force number or null
        description,
        downLink,
        licenses,
        thumbnailFile: null // placeholder for GraphQL multipart spec
      };

      // Local validation
      try {
        titleSchema(1,50).parse(title);
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
          operationName: "InsertNewProduct",
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
    <section id="create-new-product-form" className="space-y-2">      
      <form className="space-y-4 max-w-xl mx-auto p-4" onSubmit={handleSubmit}>
        <CardGenericTitle
          cardTitle="🏷️ Title" 
          value={title} 
          setValue = {(newTitle) => setTitle(newTitle)}
          minChars={5}
        />
        <CardProductSlug title={title} onChange={setSlug} />
        <CardProductType selectedProductType={productType} onProductTypeChange={setProductType} />
        <CardSelectCategory
          selectedCategory={categoryId}
          productType={productType}
          onSelectCategory={setCategoryId}
          returnId={true}
        />
        <CardProductDescription
          cardTitle="📝 Description"
          value={description}
          setValue={(newDescription) =>
            setDescription(newDescription)
          }
        />
        <CardProductDownloadLink 
          cardTitle="🔗 Google Drive Link (source)"
          value={downLink} 
          onChange={setDownLink} 
        />
        <CardProductVersion 
        cardTitle="#️⃣ Version"
        value={version} onChange={setVersion} />
        <CardProductLicenses 
        fileId={creatorId} updateParentLicenses={handleLicensesChange} 
        />
        <CardProductThumbnail
          thumbnailUrl={""} 
          onChange={(file) => setThumbnailFile(file) } 
          maxSize={150 * 1024}
        />


        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded w-full"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create New Product"}
        </button>

        {error && <ErrorAlert message={error} />}
      </form>
    </section> 
  );
}
