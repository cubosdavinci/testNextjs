import GetProduct from "@/components/products/GetProduct";

interface PageProps {
  params: Promise<{ id: string }>; // ✅ make params a Promise
}

export const metadata = {
  title: `Product | ${process.env.APP_Name || "MyApp"}`,
};

export default async function GetProductPage({ params }: PageProps) {
  const { id } = await params; // ✅ must await params in Next.js App Router

  // Mocked client ID (replace later with session)
  const clientId = "a8d30f0e-6ae8-46ac-8a66-1989732b936b";

  if (!clientId) {
    return (
      <div className="p-6 text-red-500">
        You must be logged in to view this product.
      </div>
    );
  }
  
  return(
    <section className="p-6 max-w-3xl mx-auto">
      <header className="mb-4">
        <h2 className="text-xl font-semibold">Editing Product</h2>
      </header>

      <GetProduct id={id} />
    </section>
  ) ;
}
