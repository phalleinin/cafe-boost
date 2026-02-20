"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { MenuItem } from "@/types/menu";
import Link from "next/link";

const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) throw new Error("Not authenticated");

const { data: profile } = await supabase
  .from("profiles")
  .select("cafe_id")
  .eq("id", user.id)
  .single();

export default function OwnerMenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch menu from Supabase
  useEffect(() => {
    let cancelled = false;

    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("menus")
          .select("*")
          .eq ("cafe_id", profile.cafe_id)
          .order("is_available", {ascending: false})
          .order("price", { ascending: true });

        if (error) throw error;
        if (!cancelled) setMenu(data || []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error loading menu");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMenu();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <section className="max-w-6xl mx-auto px-6 py-12">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight animate-fade-in">
              Manage Café Menu
            </h1>
            <p className="text-lg text-gray-600 animate-fade-in delay-100">
              Add, edit, or remove items from your café menu.
            </p>
          </div>
          <button
            className="bg-linear-to-r from-amber-600 to-amber-800 text-white px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition"
          >
            + Add New Item
          </button>
        </div>

        {/* Loading / Error */}
        {loading && <p className="text-gray-500">Loading menu…</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Menu Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {menu.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                {...!item.is_available && (
                  <span className="inline-block mb-2 text-sm text-red-600 font-semibold">
                    Unavailable
                  </span>
                )}

              >
                <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-2">{item.description}</p>
                <p className="text-lg font-bold text-amber-700 mb-4">
                  ${item.price.toFixed(2)}
                </p>

                {/* Owner Controls */}
                <div className="flex gap-2 mt-4">
                  <button className="bg-linear-to-r from-amber-600 to-amber-800 text-white px-4 py-2 rounded-full hover:opacity-90 transition">
                    Edit
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-full hover:opacity-90 transition">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

       
        {/* ✅ Generate QR Button */}
        <div className="flex justify-center mt-8">
        <Link
            href="/owner/menuQR"
            className={`px-8 py-4 rounded-full shadow-lg transition ${
            menu.length > 0
                ? "bg-linear-to-r from-amber-600 to-amber-800 text-white hover:opacity-90"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
        >
            Generate QR for the Menu
        </Link>
        </div>

      </section>
    </main>
  );
}