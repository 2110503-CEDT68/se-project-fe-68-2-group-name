import CoWorkingCatalog from "@/components/CoWorkingCatalog";
import getCoworking from "@/libs/getCoworking";

export default async function SpacesPage() {
  const CoWorkings = await getCoworking();

  return (
    <main className="bg-[#f5f7fb] min-h-screen">
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-left text-gray-500">
          <CoWorkingCatalog CoJson={CoWorkings} />
        </div>
      </section>
    </main>
  );
}