'use client';

import { useCallback, useState } from "react";
import { License } from "@/lib/db/licenses/types/License";
import CardProductLicenses from "@/components/products/create/CardProductLicenses";
import ErrorAlert from "@/components/banners/ErrorAlert";
import InfoAlert from "@/components/banners/old/InfoAlert";
import { MembershipEnum } from "@/lib/enum/MembershipEnum";

interface Props {
  fileId: string;
}

export default function CreateLicensesTest({ fileId }: Props) {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLicensesChange = useCallback((updatedLicenses: License[]) => {
    setLicenses(updatedLicenses);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null); // clear previous info

    try {
      if (!fileId || licenses.length === 0) {
        throw new Error("File ID and at least one license are required.");
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operationName: "InsertNewLicenses",
          variables: {
            fileId,
            licenses,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to create licenses");
      }

      // Show success message
      setInfo("Licenses created successfully!");

      // Reset form
      setLicenses([]);
    } catch (err: any) {
      setError(err.message || "Unexpected server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="create-new-licenses-form" className="space-y-2">
      <form className="space-y-4 max-w-xl mx-auto p-4" onSubmit={handleSubmit}>
        <CardProductLicenses
          fileId={fileId}
          updateParentLicenses={handleLicensesChange}
          membership={MembershipEnum.Partner}
        />

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded w-full"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create New Licenses"}
        </button>

        {info && (
          <InfoAlert
            message={info}     // use state message
            duration={5000}    // auto-hide after 5s
          />
        )}

        {error && <ErrorAlert message={error} />}
      </form>
    </section>
  );
}
