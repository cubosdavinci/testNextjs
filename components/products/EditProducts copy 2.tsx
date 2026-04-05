'use client';

import { useEffect, useState } from "react";
import { Product } from "@/types/db/products";
import ErrorAlert from "@/components/banners/ErrorAlert";
import InfoAlert from "@/components/banners/InfoAlert";
import { useRouter } from "next/navigation";

interface EditProductsProps {
  creatorId: string;
  statusFilter?: string | null;
  categoryFilter?: string | null;
  limit?: number;
  sort?: { field: string; direction: "ASC" | "DESC" };
}

export default function EditProducts({
  creatorId,
  statusFilter = null,
  categoryFilter = null,
  limit = 50,
  sort = { field: "created_at", direction: "DESC" },
}: EditProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/supabase/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operationName: "GetProductsByUser",
            variables: { creatorId, statusFilter, categoryFilter, limit, sort },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch products");

        setProducts(data?.data ?? []);
      } catch (err: any) {
        setError(err.message || "Error fetching products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [creatorId, statusFilter, categoryFilter, limit, sort]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/supabase/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operationName: "DeleteProduct", variables: { productId: id } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete product");

      setProducts(prev => prev.filter(p => p.id !== id));
      setInfo("Product deleted successfully!");
    } catch (err: any) {
      setError(err.message || "Error deleting product");
    }
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="overflow-x-auto space-y-4">
      <div className="h-16">
        {error && <ErrorAlert message={error} />}
        {info && <InfoAlert message={info} duration={3000} />}
      </div>

      {products.length === 0 ? (
        <div>No products found.</div>
      ) : (
        <table className="table-auto w-full border border-gray-300 rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Thumbnail</th>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-t">
                <td className="px-4 py-2">
                  {product.thumbnail_url ? (
                    <img src={product.thumbnail_url} className="w-16 h-16 object-cover rounded" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded" />
                  )}
                </td>
                <td className="px-4 py-2">{product.name}</td>
                <td className="px-4 py-2">{product.category_name || "—"}</td>
                <td className="px-4 py-2 flex space-x-2">
                  <button
                    type="button"
                    className="px-2 py-1 bg-blue-500 text-white rounded"
                    onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
