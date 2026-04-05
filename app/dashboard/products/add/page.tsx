import CreateProduct from "@/components/products/create/CreateProduct";
import Image from "next/image";
export const metadata = {
  title: `Create Product | ${process.env.APP_Name || "MyApp"}`,
};

export default function CreateProductPage() {
  // Replace with the actual creatorId, e.g., from session
  const creatorId = "a8d30f0e-6ae8-46ac-8a66-1989732b936b";
  //const creatorId = null;

  return (
    <section className="p-6 max-w-3xl mx-auto">
      <header className="mb-4">
        <h2 className="text-xl font-semibold flex items-center justify-center gap-2">
  <Image
    src="/images/product/new-product-red-banner-500x413.jpg"
    alt="New Product Icon"
    width={48}    // icon width
    height={48}   // icon height
  />
  Create a New Product
</h2>
      </header>

      <CreateProduct creatorId={creatorId} />
    </section>
  );
}
