import Link from "next/link";

export default function BaristaDashboard() {
  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <section className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <h1 className="text-4xl font-bold tracking-tight mb-4 animate-fade-in">
          Barista Dashboard
        </h1>
        <p className="text-lg text-gray-600 mb-10 animate-fade-in delay-100">
          View incoming orders and prepare drinks efficiently.
        </p>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Orders Queue */}
          <div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="text-3xl mb-4">📥</div>
            <h3 className="text-xl font-semibold mb-3">Orders Queue</h3>
            <p className="text-gray-600 mb-6">
              View and update order status in real time.
            </p>
            <Link
              href="/barista/orders"
              className="inline-block bg-linear-to-r from-amber-600 to-amber-800 text-white px-5 py-2 rounded-full font-medium hover:opacity-90 transition"
            >
              View Orders
            </Link>
          </div>

          {/* Payment Confirmation */}
          <div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="text-3xl mb-4">💳</div>
            <h3 className="text-xl font-semibold mb-3">Payment Status</h3>
            <p className="text-gray-600 mb-6">
              Verify sandbox payments before preparing drinks.
            </p>
            <Link
              href="/barista/payments"
              className="inline-block bg-linear-to-r from-amber-600 to-amber-800 text-white px-5 py-2 rounded-full font-medium hover:opacity-90 transition"
            >
              Check Payments
            </Link>
          </div>

          {/* Popular Items */}
          <div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="text-3xl mb-4">🔥</div>
            <h3 className="text-xl font-semibold mb-3">Popular Items</h3>
            <p className="text-gray-600 mb-6">
              See trending menu items to prepare for demand.
            </p>
            <Link
              href="/barista/popular"
              className="inline-block bg-linear-to-r from-amber-600 to-amber-800 text-white px-5 py-2 rounded-full font-medium hover:opacity-90 transition"
            >
              View Popular Items
            </Link>
          </div>

          {/* Menu (Read-Only) */}
          <div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="text-3xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-3">Menu Management</h3>
            <p className="text-gray-600 mb-6">
              Browse the café menu (read-only view).
            </p>
            <Link
              href="/barista/menu"
              className="inline-block bg-linear-to-r from-amber-600 to-amber-800 text-white px-5 py-2 rounded-full font-medium hover:opacity-90 transition"
            >
              View Menu
            </Link>
          </div>

        </div>
      </section>
    </main>
  );
}
