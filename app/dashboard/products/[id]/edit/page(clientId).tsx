import EditProduct from "@/components/products/EditProduct";


interface PageProps {
  params: { id: string };
}

export const metadata = {
  title: `Edit Product | ${process.env.APP_Name || "MyApp"}`,
};

export default async function EditProductPage({ params }: PageProps) {
  const { id } = params;

  // Example: fetch user session to get client/creator id
  // const session = await getServerSession();
  // const clientId = session?.user?.id;
  const clientId = "a8d30f0e-6ae8-46ac-8a66-1989732b936b"; // placeholder

  if (!clientId) {
    return <div className="p-6 text-red-500">You must be logged in to edit this product.</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <EditProduct id={id} clientId={clientId} />
    </div>
  );
}
