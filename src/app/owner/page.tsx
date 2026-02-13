import Link from "next/link";

export default function OwnerDashboard() {
  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <section className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <h1 className="text-4xl font-bold tracking-tight mb-4 animate-fade-in">
          Owner Dashboard
        </h1>
        <p className="text-lg text-gray-600 mb-10 animate-fade-in delay-100">
          Manage your café, track sales, and view analytics.
        </p>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Menu Management */}
          <div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="text-3xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-3">Menu Management</h3>
            <p className="text-gray-600 mb-6">
              Add, edit, or remove menu items and update stock.
            </p>
            <Link
              href="/owner/menu"
              className="inline-block bg-linear-to-r from-amber-600 to-amber-800 text-white px-5 py-2 rounded-full font-medium hover:opacity-90 transition"
            >
              Manage Menu
            </Link>
          </div>

          {/* Orders & Payments */}
          <div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="text-3xl mb-4">🧾</div>
            <h3 className="text-xl font-semibold mb-3">Orders & Payments</h3>
            <p className="text-gray-600 mb-6">
              Monitor orders, track payments, and manage refunds.
            </p>
            <Link
              href="/owner/orders"
              className="inline-block bg-linear-to-r from-amber-600 to-amber-800 text-white px-5 py-2 rounded-full font-medium hover:opacity-90 transition"
            >
              View Orders
            </Link>
          </div>

          {/* Analytics */}
          <div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3">Analytics</h3>
            <p className="text-gray-600 mb-6">
              Track page views, popular items, and peak hours.
            </p>
            <Link
              href="/owner/analytics"
              className="inline-block bg-linear-to-r from-amber-600 to-amber-800 text-white px-5 py-2 rounded-full font-medium hover:opacity-90 transition"
            >
              View Analytics
            </Link>
          </div>

          {/* AI Insights */}
          <div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-3">AI Insights</h3>
            <p className="text-gray-600 mb-6">
              Get recommendations and guided search for your café.
            </p>
            <Link
              href="/owner/insights"
              className="inline-block bg-linear-to-r from-amber-600 to-amber-800 text-white px-5 py-2 rounded-full font-medium hover:opacity-90 transition"
            >
              Explore Insights
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

        </div>
      </section>
    </main>
  );
}
