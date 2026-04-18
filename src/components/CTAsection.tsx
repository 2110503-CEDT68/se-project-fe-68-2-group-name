import Link from "next/link";

export default function CTASection() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="rounded-none bg-blue-500 py-20 text-center text-white">
          <h2 className="text-4xl font-bold">
            Ready to Get Started?
          </h2>

          <p className="mt-4 text-blue-100">
            Join our community and book your ideal workspace today
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/spaces" className="hover:text-blue-500">
              <button className="rounded-md bg-white px-6 py-3 text-sm font-medium text-blue-500 hover:bg-gray-100">
                Browse Spaces
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}