'use client';
import { useState, useEffect } from "react";
import { consoleLog } from "@/lib/utils";
import CardProductTitle from "@/components/products/create/CardProductTitle";
import CardSelectCategory from "@/components/products/CardSelectCategory";
import CardProductDownloadLink from "@/components/products/create/CardProductDownloadLink";
import CardProductThumbnail from "@/components/products/create/CardProductThumbnail";
import TipTapEditor from "@/components/ui/TipTapEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProdType } from "@/types/db/products";
import CardProductType from "../create/CardProductType";
import CardProductVersion from "@/components/products/CardProductVersion";
import CardProductDescription from "../create/CardProductDescription";
import CardProductLicenses from "../create/CardProductLicenses"; // Use CardProductLicenses for license management
import {License, LicenseType} from "@/types/db/licenses";

/*
interface License {
  price: number;
  typeId: string;
  isMain: boolean;
}*/

/*
interface LicenseType {
  id: string;
  name: string;
}*/

interface Props {
  creatorId: string;
}

export default function CreateProduct({ creatorId }: Props) {
  consoleLog("⚠️ Start components/products/CreateProduct.tsx");
  consoleLog("Creator ID:", creatorId);

  const [title, setTitle] = useState("");
  const [productType, setProductType] = useState<ProdType>(ProdType.ThreeD);
  const [categoryId, setCategoryId] = useState<string |number | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [srcDownloadLink, setProductDownloadLink] = useState("");
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);

  // --- License state ---

  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);
    const [licenses, setLicenses] = useState<License[]>([
    { price: 0, isMain: true, typeId: null, type: null},
  ]);

  // Fetch license types on mount
  useEffect(() => {
    async function fetchLicenseTypes() {
      consoleLog("Fetching license types...");
      try {
        const res = await fetch("/api/licenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operationName: "GetLicenseTypes",
            variables: { clientId: creatorId },
          }),
        });
        const data = await res.json();
        setLicenseTypes(data ?? []);
      } catch (err) {
        console.error("Failed to fetch license types", err);
      }
    }
    fetchLicenseTypes();
  }, [creatorId]);

  // Handle changes in licenses
  const handleLicenseChange = (index: number, field: keyof License, value: any) => {
     setLicenses((prev) => {
      const newLicenses = [...prev];
      if (field === "isMain") {
        newLicenses.forEach((l, i) => (l.isMain = i === index));
      } else {
        (newLicenses[index] as any)[field] = value; // <── Fix
      }
      return newLicenses;
    });
    /*setLicenses((prev) => {
      const newLicenses = [...prev];
      if (field === "isMain") {
        // Only one main license can be true
        newLicenses.forEach((l, i) => (l.isMain = i === index));
      } else {
        newLicenses[index][field] = value;
      }
      return newLicenses;
    });*/
  };

  // Add a new license
  const addLicense = () => {
    setLicenses((prev) => [...prev, { price: 0, typeId: null, isMain: false, type:null }]);
  };

  // Remove a license
  const removeLicense = (index: number) => {
    setLicenses((prev) => {
      const newLicenses = prev.filter((_, i) => i !== index);
      if (!newLicenses.some((l) => l.isMain) && newLicenses.length > 0) {
        newLicenses[0].isMain = true; // Ensure one license is always marked as the main license
      }
      return newLicenses;
    });
  };

  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append(
        "operations",
        JSON.stringify({
          operationName: "CreateProduct",
          variables: {
            creatorId,
            title,
            productType,
            slug,
            categoryId,
            srcDownloadLink,
            description,
            licenses,
          },
        })
      );

      if (thumbnailFile) {
        formData.append("map", JSON.stringify({ "1": ["variables.thumbnailFile"] }));
        formData.append("1", thumbnailFile);
      }

      const res = await fetch("/api/supabase/products", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product");

      window.location.href = `/dashboard/products/${data?.data?.id}`;

      // Reset form
      setTitle("");
      setSlug("");
      setCategoryId(null);
      setThumbnailFile(null);
      setProductDownloadLink("");
      setDescription("");
      setLicenses([{ price: 0, typeId: null, isMain: true, type: null }]);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4 max-w-xl mx-auto p-4" onSubmit={handleSubmit}>
      <CardProductTitle value={title} onChange={setTitle} />
      <CardProductType selectedProductType={productType} onProductTypeChange={setProductType} />
      <CardSelectCategory selectedCategory={categoryId} productType={productType} onSelectCategory={setCategoryId} returnId={true} />
      <CardProductThumbnail thumbnailUrl={""} onChange={(file) => setThumbnailFile(file)} />
      <CardProductDownloadLink value={srcDownloadLink} onChange={setProductDownloadLink} />
      <CardProductVersion value={version} onChange={setVersion} />
      <CardProductDescription value={description} onChange={setDescription} />

      {/* License Management */}
      <CardProductLicenses
        licenses={licenses}
        licenseTypes={licenseTypes}
        onLicenseChange={handleLicenseChange}
        addLicense={addLicense}
        removeLicense={removeLicense}
      />

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded w-full"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create New Product"}
      </button>
    </form>
  );
}
