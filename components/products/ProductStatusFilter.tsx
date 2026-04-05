"use client";

interface ProductStatusFilterProps {
  value: string | undefined;
  onChange: (value: "draft" | "published" | "archived" | undefined) => void;
}

export default function ProductStatusFilter({
  value,
  onChange,
}: ProductStatusFilterProps) {
  return (
    <select
      className="border p-2 rounded"
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? undefined : (v as any));
      }}
    >
      <option value="">All Statuses</option>
      <option value="draft">Draft</option>
      <option value="published">Published</option>
      <option value="archived">Archived</option>
    </select>
  );
}
