'use client';

import { useEffect, useState } from "react";
import { Product } from "@/types/db/products";
import ErrorAlert from "@/components/banners/ErrorAlert";
import InfoAlert from "@/components/banners/InfoAlert";
import { useRouter } from "next/navigation";

interface EditProductsProps {
  clientId: string;
}

export default function EditProducts({ clientId }: EditProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const router = useRouter();

  // Fetch products for client
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/supabase/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operationName: "GetProductsByClient",
            variables: { clientId },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch products");

        if (!data?.data || data.data.length === 0) {
          setError("No products found for this client");
          setProducts([]);
        } else {
          setProducts(data.data);
        }
      } catch (err: any) {
        setError(err.message || "Error fetching products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [clientId]);

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

  const handleEdit = (id: string) => {
    router.push(`/dashboard/products/${id}/edit`);
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="overflow-x-auto space-y-4">
      {/* Reserve space for alerts to prevent table jumping */}
      <div className="h-16">
        {error && <ErrorAlert message={error} />}
        {info && <InfoAlert message={info} duration={3000} />}
      </div>

      {(!products || products.length === 0) ? (
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
            {products.map((prod) => (
              <tr key={prod.id} className="border-t">
                <td className="px-4 py-2">
                  {prod.thumbnail_url ? (
                    <img src={prod.thumbnail_url} alt={prod.name} className="w-16 h-16 object-cover rounded" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">No Img</div>
                  )}
                </td>
                <td className="px-4 py-2">{prod.name}</td>
                <td className="px-4 py-2">{prod.category_id}</td>
                <td className="px-4 py-2 flex space-x-2">
                  <button
                    type="button"
                    className="px-2 py-1 bg-blue-500 text-white rounded"
                    onClick={() => handleEdit(prod.id)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleDelete(prod.id)}
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
