"use client";

import  { type CartItem } from "@/types/menu";

interface Props {
  cart: CartItem[];
  open: boolean;
  onToggle: () => void;
}

export default function CartDrawer({ cart, open, onToggle }: Props) {
  if (!open) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg p-4 z-50">
      <h2 className="text-xl font-semibold mb-4">Your Order</h2>

      {cart.map((item, index) => (
        <div key={index} className="mb-3">
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-gray-500">
            Sugar: {item.sugarLevel}
          </p>
        </div>
      ))}

      <button
        onClick={onToggle}
        className="absolute top-4 right-4"
      >
        ✕
      </button>
    </div>
  );
}
