'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ErrorAlert from "@/components/banners/ErrorAlert";
import { Product, ProductLicense } from "@/types/db/products";

interface GetProductProps {
  id: string;
}

export default function GetProduct({ id }: GetProductProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [licenses, setLicenses] = useState<ProductLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operationName: "getProduct",
            variables: { productId: id },
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch product");

        setProduct(data?.data ?? null);
        setLicenses(data?.data?.licenses ?? []);
      } catch (err: any) {
        setError(err.message || "Error fetching product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]); // ✅ removed clientId

  if (loading) return <div className="p-4">Loading product...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">

      {/* ✅ ErrorAlert at top */}
      {error && (
        <div className="mb-4">
          <ErrorAlert message={error} />
        </div>
      )}

      {/* Stop rendering the rest if there's an error */}
      {error && null}

      {/* Product Not Found */}
      {(!product && !error) && (
        <div className="p-4 text-gray-500">Product not found.</div>
      )}

      {/* Product Content */}
      {product && (
        <>
          <div className="flex justify-end mb-4">
            <a
              href={`/dashboard/products/${product.id}/edit`}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              Edit Product
            </a>
          </div>

          <h1 className="text-2xl font-bold">{product.name || "(Unnamed Product)"}</h1>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-1">
                <span
                  className={`px-2 py-1 rounded font-semibold ${
                    product.status === "published"
                      ? "bg-green-100 text-green-800"
                      : product.status === "draft"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </span>
                {product.status === "draft" && (
                  <p className="text-yellow-700 text-sm">
                    ⚠️ This product is currently a draft and will not be listed until published.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: product.description || "<em>No description</em>",
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Thumbnail */}
          {product.thumbnailUrl ? (
            <img
              src={product.thumbnailUrl}
              alt={product.name || "Product thumbnail"}
              className="w-full max-h-80 object-contain rounded"
            />
          ) : (
            <ErrorAlert message="No thumbnail image uploaded. Edit the product to add one." />
          )}

          {/* Licenses */}
          {licenses.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Licenses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {licenses.map((lic) => (
                  <div key={lic.id} className="border p-2 rounded">
                    <p><strong>License:</strong> {lic.licenseName || "Unnamed"}</p>
                    <p><strong>Price:</strong> ${(lic.priceCents / 100).toFixed(2)} {lic.currency}</p>
                    {lic.isMain && (
                      <p className="text-green-600 font-semibold">Main License</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Licenses</CardTitle>
              </CardHeader>
              <CardContent>No licenses for this product.</CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
