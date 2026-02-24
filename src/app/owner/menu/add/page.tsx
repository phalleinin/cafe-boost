"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AddMenuItemPage() {
  const router = useRouter();

  const [cafeId, setCafeId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Get cafe_id from session
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/owner/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("cafe_id")
        .eq("id", user.id)
        .single();

      if (!profile?.cafe_id) {
        window.location.href = "/owner/setup-cafe";
        return;
      }

      setCafeId(profile.cafe_id);
    };

    init();
  }, []);

  const handleAdd = async () => {
    if (loading) return; //prevent double submission

    if (!name.trim()) {
      setError("Item name is required.");
      return;
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (!cafeId) {
      setError("Café not found. Please try again.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error: insertError } = await supabase
        .from("menus")
        .insert({
          cafe_id: cafeId,
          name: name.trim(),
          description: description.trim() || null,
          price: parseFloat(price),
          is_available: isAvailable,
        });

      if (insertError) throw new Error(insertError.message);

      // ✅ Go back to menu management page after adding
      router.push("/owner/menu");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <section className="max-w-xl mx-auto px-6 py-12">

        <h1 className="text-4xl font-bold tracking-tight mb-2">Add Menu Item</h1>
        <p className="text-gray-500 mb-8">Fill in the details for your new menu item.</p>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* Name */}
        <label htmlFor="item-name" className="block text-sm font-medium mb-1">
          Item Name *
        </label>
        <input
          id="item-name"
          type="text"
          placeholder="e.g. Matcha Latte"
          className="w-full border rounded-lg p-3 mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Description */}
        <label htmlFor="item-description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="item-description"
          placeholder="e.g. Creamy matcha with oat milk"
          className="w-full border rounded-lg p-3 mb-4 resize-none"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Price */}
        <label htmlFor="item-price" className="block text-sm font-medium mb-1">
          Price *
        </label>
        <input
          id="item-price"
          type="number"
          placeholder="0.00"
          className="w-full border rounded-lg p-3 mb-4"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="0"
          step="0.01"
          required
        />

        {/* Availability */}
        <div className="flex items-center gap-3 mb-8">
          <input
            id="item-available"
            type="checkbox"
            className="w-4 h-4 accent-amber-700"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
          />
          <label htmlFor="item-available" className="text-sm font-medium">
            Available immediately
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/owner/menu")}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-full hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={loading || !cafeId}
            className="flex-1 bg-linear-to-r from-amber-600 to-amber-800 text-white py-3 rounded-full shadow-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Item"}
          </button>
        </div>

      </section>
    </main>
  );
}