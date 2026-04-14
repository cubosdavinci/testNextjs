'use client';

import { useEffect, useState } from "react";
import { ProductLicense } from "@/types/db/products";
import ErrorAlert from "@/components/banners/ErrorAlert";
import InfoAlert from "@/components/banners/old/InfoAlert";

interface EditLicensesProps {
  productId: string;
  licenses?: ProductLicense[];
}

export default function EditLicenses({ productId, licenses: initialLicenses }: EditLicensesProps) {
  const [licenses, setLicenses] = useState<(ProductLicense & { price: number })[]>([]);
  const [loading, setLoading] = useState(!initialLicenses);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [mainLicenseId, setMainLicenseId] = useState<string | null>(null);

  // 🔹 Convert priceCents → price for UI
  useEffect(() => {
    const normalize = (list: ProductLicense[]) =>
      list.map(l => ({ ...l, price: (l.priceCents ?? 0) / 100 }));

    if (initialLicenses) {
      const normalized = normalize(initialLicenses);
      setLicenses(normalized);
      setMainLicenseId(normalized.find(l => l.isMain)?.id || null);
      return;
    }

    const fetchLicenses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/supabase/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operationName: "GetLicensesByProduct",
            variables: { productId },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch licenses");

        if (!data?.data || data.data.length === 0) {
          setError("No licenses found for this product");
          setLicenses([]);
        } else {
          const normalized = normalize(data.data);
          setLicenses(normalized);
          setMainLicenseId(normalized.find(l => l.isMain)?.id || null);
        }
      } catch (err: any) {
        setError(err.message || "Error fetching licenses");
      } finally {
        setLoading(false);
      }
    };

    fetchLicenses();
  }, [productId, initialLicenses]);

  const handleLicenseChange = (id: string, field: keyof (ProductLicense & { price: number }), value: any) => {
    setLicenses(prev => prev.map(l => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const handleMainChange = (id: string) => {
    setMainLicenseId(id);
    setLicenses(prev => prev.map(l => ({ ...l, isMain: l.id === id })));
  };

  const handleSave = async (license: ProductLicense & { price: number }) => {
    setSavingId(license.id);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/supabase/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationName: "UpdateProductLicense",
          variables: {
            licenseId: license.id,
            priceCents: Math.round(license.price * 100),
            isMain: license.isMain,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update license");
      setInfo("License updated successfully!");
    } catch (err: any) {
      setError(err.message || "Error updating license");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this license?")) return;
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/supabase/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operationName: "DeleteProductLicense", variables: { licenseId: id } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete license");
      setLicenses(prev => prev.filter(l => l.id !== id));
      setInfo("License deleted successfully!");
    } catch (err: any) {
      setError(err.message || "Error deleting license");
    }
  };

  if (loading) return <div>Loading licenses...</div>;

  return (
    <div className="overflow-x-auto space-y-4">
      {/* Reserve space for alerts to prevent table jumping */}
      <div className="h-16">
        {error && <ErrorAlert message={error} />}
        {info && <InfoAlert message={info} duration={3000} />}
      </div>

      {(!licenses || licenses.length === 0) ? (
        <div>No licenses found.</div>
      ) : (
        <table className="table-auto w-full border border-gray-300 rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">License Name</th>
              <th className="px-4 py-2 text-left">Price (USD)</th>
              <th className="px-4 py-2">Main</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((lic) => (
              <tr key={lic.id} className="border-t">
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={lic.licenseName || ""}
                    readOnly
                    className="border p-1 rounded w-full bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={lic.price ?? 0} // prevent NaN
                    min={0}
                    step={0.5}
                    onChange={(e) =>
                      handleLicenseChange(lic.id, "price", parseFloat(e.target.value) || 0)
                    }
                    className="border p-1 rounded w-full"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="radio"
                    checked={mainLicenseId === lic.id}
                    onChange={() => handleMainChange(lic.id)}
                  />
                </td>
                <td className="px-4 py-2 flex space-x-2">
                  <button
                    type="button"
                    className="px-2 py-1 bg-green-500 text-white rounded"
                    disabled={savingId === lic.id}
                    onClick={() => handleSave(lic)}
                  >
                    {savingId === lic.id ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleDelete(lic.id)}
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
