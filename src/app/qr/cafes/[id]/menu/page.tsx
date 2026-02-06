"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import MenuCard from "@/app/components/MenuCard";
import type { MenuItem, CartItem } from "@/types/menu";

export default function QRMenuPage() {
  const router = useRouter();
  const params = useParams();

  const cafeId =
    typeof params?.id === "string" ? params.id : undefined;

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [sugarLevel, setSugarLevel] = useState("100%");
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!cafeId) return;

    let cancelled = false;

    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/cafes/${cafeId}/menu`);
        if (!res.ok) {
          throw new Error("Failed to load menu");
        }

        const data: MenuItem[] = await res.json();
        if (!cancelled) setMenu(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Error loading menu"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMenu();

    return () => {
      cancelled = true;
    };
  }, [cafeId]);

  const handleAddToCart = (item: MenuItem) => {
    setSelectedItem(item);
  };

  const confirmAddToCart = () => {
    if (!selectedItem) return;

    const newItem: CartItem = {
      ...selectedItem,
      sugarLevel,
      quantity: 1,
    };

    setCart((prev) => [...prev, newItem]);
    setSelectedItem(null);
    setSugarLevel("100%");
  };

  const goToPayment = () => {
    if (!cafeId || cart.length === 0) return;

    localStorage.setItem("cart", JSON.stringify(cart));
    router.push(`/qr/cafes/${cafeId}/payment`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Menu – Artisan Brew House
      </h1>

      {loading && <p>Loading menu…</p>}

      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menu.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              isOrderEnabled
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {/* Customization Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Customize {selectedItem.name}
            </h2>

            <label htmlFor="sugar-level" className="block mb-2 font-medium">
              Sugar Level
            </label>

            <select
              id="sugar-level"
              className="w-full border rounded-lg p-2 mb-4"
              value={sugarLevel}
              onChange={(e) => setSugarLevel(e.target.value)}
            >
              <option value="0%">0%</option>
              <option value="25%">25%</option>
              <option value="50%">50%</option>
              <option value="75%">75%</option>
              <option value="100%">100%</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddToCart}
                className="px-4 py-2 rounded-lg bg-amber-700 text-white"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proceed to Payment */}
      {cart.length > 0 && (
        <button
          onClick={goToPayment}
          className="fixed bottom-6 right-6 bg-amber-700 text-white px-6 py-3 rounded-full shadow-lg"
        >
          Proceed to Payment ({cart.length})
        </button>
      )}
    </div>
  );
}
