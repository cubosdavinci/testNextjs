import ProductsByUserTable from "@/components/products/ProductsByUserTable";

export const metadata = {
  title: `All Products | ${process.env.APP_Name || "MyApp"}`,
};

export default function ProductsPage() {

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">All Products</h1>

      <ProductsByUserTable
        categoryFilter={null}
        limit={20}
        sort={{ field: "created_at", direction: "DESC" }}
      />
    </div>
  );
}
