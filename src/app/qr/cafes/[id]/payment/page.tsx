"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { CartItem } from "@/types/menu";

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();

  const cafeId =
    typeof params?.id === "string" ? params.id : undefined;

  const [cart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePayNow = () => {
    alert("Payment successful (demo)");
    localStorage.removeItem("cart");

    if (cafeId) {
      router.push(`/qr/cafes/${cafeId}/menu`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Payment</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="mb-6 space-y-2">
            {cart.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.name} ({item.sugarLevel})
                </span>
                <span>${item.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <div className="font-bold text-xl mb-6">
            Total: ${total.toFixed(2)}
          </div>

          <button
            type="button"
            onClick={handlePayNow}
            className="w-full bg-amber-700 text-white py-3 rounded-lg hover:bg-amber-800"
          >
            Pay Now
          </button>
        </>
      )}
    </div>
  );
}
