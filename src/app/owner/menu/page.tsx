"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { MenuItem } from "@/types/menu";
import Link from "next/link";

export default function OwnerMenuPage() {
  const [cafeId, setCafeId] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ✅ Step 1 — Get session + cafe_id
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/owner/login";
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("cafe_id")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        if (!profile?.cafe_id) {
          window.location.href = "/owner/setup-cafe";
          return;
        }

        setCafeId(profile.cafe_id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
        setLoading(false);
      }
    };

    init();
  }, []);

  // ✅ Step 2 — Fetch menu once cafeId is available
  useEffect(() => {
    if (!cafeId) return;

    let cancelled = false;

    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("menus")
          .select("*")
          .eq("cafe_id", cafeId)
          .order("is_available", { ascending: false })
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
    return () => { cancelled = true; };
  }, [cafeId]);

  // ✅ Toggle availability
  const handleToggleAvailability = async (item: MenuItem) => {
    const { error } = await supabase
      .from("menus")
      .update({ is_available: !item.is_available })
      .eq("id", item.id);

    if (error) {
      alert("Failed to update availability");
      return;
    }

    setMenu((prev) =>
      prev.map((m) =>
        m.id === item.id ? { ...m, is_available: !m.is_available } : m
      )
    );
  };

  // ✅ Delete item
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setDeletingId(id);

    const { error } = await supabase
      .from("menus")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Failed to delete item");
      setDeletingId(null);
      return;
    }

    setMenu((prev) => prev.filter((m) => m.id !== id));
    setDeletingId(null);
  };

  // ✅ Save edited item
  const handleSaveEdit = async () => {
    if (!editingItem) return;

    const { error } = await supabase
      .from("menus")
      .update({
        name: editingItem.name,
        description: editingItem.description,
        price: editingItem.price,
        is_available: editingItem.is_available,
      })
      .eq("id", editingItem.id);

    if (error) {
      alert("Failed to update item");
      return;
    }

    setMenu((prev) =>
      prev.map((m) => (m.id === editingItem.id ? editingItem : m))
    );
    setEditingItem(null);
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <section className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight animate-fade-in">
              Manage Café Menu
            </h1>
            <p className="text-lg text-gray-600 animate-fade-in delay-100">
              Add, edit, or remove items from your café menu.
            </p>
          </div>
          <Link
            href="/owner/menu/add"
            className="bg-linear-to-r from-amber-600 to-amber-800 text-white px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition"
          >
            + Add New Item
          </Link>
        </div>

        {/* Loading / Error */}
        {loading && <p className="text-gray-500">Loading menu…</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Empty state */}
        {!loading && !error && menu.length === 0 && (
          <p className="text-gray-500">No menu items yet. Add your first item!</p>
        )}

        {/* Menu Grid */}
        {!loading && !error && menu.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {menu.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                {!item.is_available && (
                  <span className="inline-block mb-2 text-sm text-red-600 font-semibold">
                    Unavailable
                  </span>
                )}

                <h3 className="text-xl font-semibold mb-1">{item.name}</h3>
                <p className="text-gray-600 mb-2 text-sm">{item.description}</p>
                <p className="text-lg font-bold text-amber-700 mb-4">
                  ${item.price.toFixed(2)}
                </p>

                <div className="flex gap-2 mt-4 flex-wrap">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="bg-linear-to-r from-amber-600 to-amber-800 text-white px-4 py-2 rounded-full hover:opacity-90 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="bg-red-600 text-white px-4 py-2 rounded-full hover:opacity-90 transition text-sm disabled:opacity-50"
                  >
                    {deletingId === item.id ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-100 transition text-sm"
                  >
                    {item.is_available ? "Mark Unavailable" : "Mark Available"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Generate QR Button */}
        <div className="flex justify-center mt-8">
          <Link
            href="/owner/menuQR"
            className={`px-8 py-4 rounded-full shadow-lg transition ${
              menu.length > 0
                ? "bg-linear-to-r from-amber-600 to-amber-800 text-white hover:opacity-90"
                : "bg-gray-300 text-gray-600 cursor-not-allowed pointer-events-none"
            }`}
          >
            Generate QR for the Menu
          </Link>
        </div>

      </section>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Edit Menu Item</h2>

            {/* ✅ Each input has a proper label — fixes axe/forms warning */}
            <label htmlFor="edit-name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              id="edit-name"
              className="w-full border rounded-lg p-2 mb-3"
              placeholder="Item name"
              value={editingItem.name}
              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
            />

            <label htmlFor="edit-description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="edit-description"
              className="w-full border rounded-lg p-2 mb-3 resize-none"
              placeholder="Item description"
              rows={2}
              value={editingItem.description || ""}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
            />

            <label htmlFor="edit-price" className="block text-sm font-medium mb-1">
              Price
            </label>
            <input
              id="edit-price"
              type="number"
              className="w-full border rounded-lg p-2 mb-4"
              placeholder="0.00"
              value={editingItem.price}
              onChange={(e) =>
                setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-lg bg-linear-to-r from-amber-600 to-amber-800 text-white hover:opacity-90 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}