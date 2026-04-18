import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-[#c8d7f7]">
      <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
            Book Your Perfect{" "}
            <span className="text-blue-500">Workspace</span>
          </h1>

          <p className="mt-6 max-w-md text-gray-600">
            Find and reserve the ideal coworking space for your needs.
            Flexible, affordable, and designed for productivity.
          </p>
          <Link href="/spaces">
          <button className="mt-8 rounded-md bg-blue-500 px-6 py-3 text-sm font-medium text-white shadow hover:bg-blue-600">
            Browse Spaces
          </button>
          </Link>
        </div>

        <div className="relative h-[320px] w-full overflow-hidden rounded-2xl">
          <Image
            src="/img/hero-workspace.jpg"
            alt="Workspace"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}