import EditProduct from "@/components/products/EditProduct";

interface PageProps {
  params: Promise<{ id: string }>; // ✅ params must be awaited
}

export const metadata = {
  title: `Edit Product | ${process.env.APP_Name || "MyApp"}`,
};

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params; // ✅ required in Next.js App Router

  return (
    <section className="p-6 max-w-3xl mx-auto">
      <header className="mb-4">
        <h2 className="text-xl font-semibold">Editing Product</h2>
      </header>

      <EditProduct productId={id} />
    </section>
    );
  
}
