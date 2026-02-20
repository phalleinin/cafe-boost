"use client";

import Link from "next/link";

export default function OwnerEntryPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-b from-white to-gray-50">
      <section className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome, Shop Owner ☕</h1>
        <p className="text-gray-600 mb-10">
          Let’s get your café online with smart QR ordering.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/owner/login"
            className="bg-linear-to-r from-amber-600 to-amber-800 text-white py-4 rounded-full text-lg font-semibold shadow hover:opacity-90 transition"
          >
            I already have an account
          </Link>

          <Link
            href="/owner/signup"
            className="border border-amber-700 text-amber-700 py-4 rounded-full text-lg font-semibold hover:bg-amber-50 transition"
          >
            I’m new — create my café
          </Link>
        </div>
      </section>
    </main>
  );
}
