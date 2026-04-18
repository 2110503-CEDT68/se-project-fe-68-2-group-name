export default function WhyChooseSection() {
  return (
    <section className="bg-[#f7f7f7] py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Why Choose CoSpace?
          </h2>
          <p className="mt-3 text-gray-500">
            Everything you need for a productive work environment
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-2xl">
              🛜
            </div>
            <h3 className="text-lg font-semibold text-gray-900">High-Speed WiFi</h3>
            <p className="mt-2 text-sm text-gray-500">
              Reliable fiber internet connection for seamless work
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-2xl">
              🕒
            </div>
            <h3 className="text-lg font-semibold text-gray-900">24/7 Access</h3>
            <p className="mt-2 text-sm text-gray-500">
              Work on your schedule with round-the-clock availability
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-2xl">
              ☕
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Free Amenities</h3>
            <p className="mt-2 text-sm text-gray-500">
              Complimentary coffee, tea, and snacks included
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-2xl">
              🔒
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Secure Spaces</h3>
            <p className="mt-2 text-sm text-gray-500">
              Advanced security systems for peace of mind
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}