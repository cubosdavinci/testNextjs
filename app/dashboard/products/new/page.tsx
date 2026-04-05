import ProductForm from "@/components/saleor/products/ProductForm";
import { auth } from "@/app/api/auth/[...nextauth]/auth";

export default async function NewProductPage() {
  //const session = await auth(); // <- this replaces getServerSession
  //const userId = "session?.user?.id;"
    const userId = "a8d30f0e-6ae8-46ac-8a66-1989732b936b"
  if (!userId) {
    return <p className="text-red-500">You must be logged in to create a product.</p>;
  }

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-6">Create a New Product</h1>
      <ProductForm creatorId={userId} />
    </section>
  );
}
