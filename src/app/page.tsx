import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        {/* Hero */}
        <h1 className="text-5xl font-bold tracking-tight mb-6 animate-fade-in">
          CafeBoost
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-14 animate-fade-in delay-100">
          Smart QR ordering and café management system built for
          coffee shops.
        </p>

        {/* Role Cards */}
          {/* Owner */}
          <div>
          <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="text-4xl mb-4">🧑‍💼</div>
            <h3 className="text-xl font-semibold mb-3">
              Shop Owner
            </h3>
            <p className="text-gray-600 mb-6">
              Manage menus and grow your café digitally.
            </p>
            <Link
              href="/owner"
              className="inline-block bg-linear-to-r from-amber-600 to-amber-800 text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition"
            >
              Owner Login
            </Link>
          </div>

          {/* Barista */}
          <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="text-4xl mb-4">👩‍🍳</div>
            <h3 className="text-xl font-semibold mb-3">
              Barista
            </h3>
            <p className="text-gray-600 mb-6">
              View incoming orders and prepare drinks efficiently.
            </p>
            <Link
              href="/barista"
              className="inline-block bg-linear-to-r from-amber-600 to-amber-800 text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition"
            >
              Barista Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
