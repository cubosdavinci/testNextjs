"use client";

import { useEffect, useState } from "react";
import ProductStatusFilter from "./ProductStatusFilter";
import { Product } from "@/types/db/products";

interface Props {
  creatorId: string;
  categoryFilter?: number | null;
  limit?: number;
  sort?: { field: "name" | "created_at" | "updated_at"; direction: "ASC" | "DESC" };
}

export default function ProductsByUserTable({
  creatorId,
  categoryFilter,
  limit = 20,
  sort = { field: "created_at", direction: "DESC" },
}: Props) {
  const [status, setStatus] = useState<"draft" | "published" | "archived" | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Delete handler
  async function handleDelete(productId: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch("/api/supabase/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationName: "DeleteProduct",
          variables: { productId: productId },
        }),
      });

      const result = await res.json();

      if (result.error) {
        alert("Failed to delete product: " + result.error.message);
        return;
      }

      // ✅ Remove deleted product from table
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err: any) {
      alert(err.message || "Unexpected error deleting product");
    }
  }

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/supabase/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operationName: "GetProductsByUser",
            variables: {
              creatorId,
              status,
              categoryId: categoryFilter,
              limit,
              sort,
            },
          }),
        });

        const result = await res.json();

        if (result.error) {
          setError(result.error.message || "Failed to fetch products");
        } else {
          setProducts(result.data || []);
        }
      } catch (err: any) {
        setError(err.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [creatorId, status, categoryFilter, limit, sort]);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <ProductStatusFilter value={status} onChange={setStatus} />
      </div>

      {products.length === 0 ? (
        <div className="text-gray-600">No products found.</div>
      ) : (
        <table className="w-full border border-gray-300 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Thumbnail</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Created</th>

              {/* ✅ New Columns */}
              <th className="p-2 text-left">Edit</th>
              <th className="p-2 text-left">Delete</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t">

                {/* Thumbnail */}
                <td className="p-2">
                  {product.thumbnailUrl ? (
                    <img
                      src={product.thumbnailUrl}
                      alt={product.name}
                      className="w-14 h-14 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-200 text-gray-500 flex items-center justify-center rounded border text-xs">
                      No Image
                    </div>
                  )}
                </td>

                <td className="p-2">{product.name}</td>
                <td className="p-2">{product.status}</td>
                <td className="p-2">{product.categoryName}</td>
                <td className="p-2">{new Date(product.createdAt).toLocaleDateString()}</td>

                {/* ✅ Edit Button */}
                <td className="p-2">
                  <a
                    href={`/dashboard/products/${product.id}/edit`}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Edit
                  </a>
                </td>

                {/* ✅ Delete Button */}
                <td className="p-2">
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Del
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
