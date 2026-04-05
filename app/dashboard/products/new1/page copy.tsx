"use client";

import { useState } from "react";

export default function NewDigitalProductPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [price, setPrice] = useState("");
  const [urlContentLink, setUrlContentLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Upload thumbnail if needed
      let thumbnailUrl: string | null = null;
      if (thumbnail) {
        const formData = new FormData();
        formData.append("file", thumbnail);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        thumbnailUrl = uploadData.url;
      }

      // Call internal API route
      const res = await fetch("/api/products/create-digital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          thumbnailUrl,
          price,
          urlContentLink,
          productTypeId: process.env.NEXT_PUBLIC_DIGITAL_PRODUCT_TYPE_ID, // digital product type
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(true);
        setTitle("");
        setDescription("");
        setCategory("");
        setThumbnail(null);
        setPrice("");
        setUrlContentLink("");
      }
    } catch (err) {
      setError("Failed to create product");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Digital Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">Product created successfully!</p>}

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input type="file" onChange={(e) => setThumbnail(e.target.files?.[0] || null)} />

        <input
          type="number"
          step="0.01"
          placeholder="Price (USD)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Digital Content URL"
          value={urlContentLink}
          onChange={(e) => setUrlContentLink(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}