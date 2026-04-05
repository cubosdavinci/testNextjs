import CreateLicensesTest from "@/components/products/create/CreateLicensesTest";

export const metadata = {
  title: `Create File Licenses | ${process.env.APP_Name || "MyApp"}`,
};

export default function CreateProductPage() {
  // Replace with the actual creatorId, e.g., from session
  const fileId = "87c90367-e9bb-466f-9fbf-794fd2979157";

  return (
    <section className="p-6 max-w-3xl mx-auto">
      <header className="mb-4">
        <h2 className="text-xl font-semibold">🎁 Create Product Licenses</h2>
      </header>
    <CreateLicensesTest fileId={fileId} />
    </section>
  );
}
