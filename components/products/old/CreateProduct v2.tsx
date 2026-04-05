"use client";

import { useState, useEffect } from "react";
import ProductTitleCard from "@/components/products/create/CardProductTitle";
import SelectCategoryCard from "@/components/products/CardSelectCategory";
import TipTapEditor from "@/components/ui/TipTapEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface License {
  price: number;
  typeId: string;
  isMain: boolean;
}

interface LicenseType {
  id: string;
  name: string;
}

interface Props {
  creatorId: string;
}

export default function CreateProduct({ creatorId }: Props) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // --- License state ---
  const [licenses, setLicenses] = useState<License[]>([
    { price: 0, typeId: "", isMain: true },
  ]);
  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);

  // Fetch license types on mount
  useEffect(() => {
    async function fetchLicenseTypes() {
      try {
        const res = await fetch("/api/supabase/licenses", {
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

  const handleLicenseChange = (index: number, field: keyof License, value: any) => {
    setLicenses((prev) => {
      const newLicenses = [...prev];
      if (field === "isMain") {
        // Only one main license
        newLicenses.forEach((l, i) => (l.isMain = i === index));
      } else {
        newLicenses[index][field] = value;
      }
      return newLicenses;
    });
  };

  const addLicense = () => {
    setLicenses((prev) => [...prev, { price: 0, typeId: "", isMain: false }]);
  };

  const removeLicense = (index: number) => {
    setLicenses((prev) => {
      const newLicenses = prev.filter((_, i) => i !== index);
      // Ensure at least one license is main
      if (!newLicenses.some((l) => l.isMain) && newLicenses.length > 0) {
        newLicenses[0].isMain = true;
      }
      return newLicenses;
    });
  };

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
            thumbnailUrl,
            contentUrl,
            description,
            licenses, // send all license objects
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product");

      alert("Product created with ID: " + data?.data?.id);

      // Reset form
      setTitle("");
      setSlug("");
      setCategoryId(null);
      setThumbnailUrl("");
      setContentUrl("");
      setDescription("");
      setLicenses([{ price: 0, typeId: "", isMain: true }]);
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

      {/* Licenses */}
      {licenses.map((license, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>
              License {index + 1} {license.isMain && "(Main)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <input
              type="number"
              placeholder="Price"
              value={license.price}
              onChange={(e) => handleLicenseChange(index, "price", parseFloat(e.target.value))}
              className="border p-2 rounded w-full"
              required
            />
            <select
              value={license.typeId}
              onChange={(e) => handleLicenseChange(index, "typeId", e.target.value)}
              className="border p-2 rounded w-full"
              required
            >
              <option value="">Select License Type</option>
              {licenseTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <label>
                <input
                  type="radio"
                  checked={license.isMain}
                  onChange={() => handleLicenseChange(index, "isMain", true)}
                />{" "}
                Main License
              </label>
              {index > 0 && (
                <button
                  type="button"
                  className="text-red-500"
                  onClick={() => removeLicense(index)}
                >
                  Remove
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <button
        type="button"
        className="px-3 py-1 bg-green-500 text-white rounded"
        onClick={addLicense}
      >
        Add Another License
      </button>

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
