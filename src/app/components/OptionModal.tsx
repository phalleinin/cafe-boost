"use client";

import { useState, type ChangeEvent } from "react";
import { type MenuItem, type CartItem } from "@/types/menu";

interface Props {
  item: MenuItem;
  onClose: () => void;
  onConfirm: (item: CartItem) => void;
}

export default function OptionModal({ item, onClose, onConfirm }: Props) {
  const [sugarLevel, setSugarLevel] = useState("100%");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          Customize {item.name}
        </h2>

        <label htmlFor="sugar-level" className="block mb-2 font-medium">Sugar Level</label>
        <select
          id="sugar-level"
          className="w-full border rounded-lg p-2 mb-4"
          value={sugarLevel}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setSugarLevel(e.target.value)}
        >
          <option>0%</option>
          <option>25%</option>
          <option>50%</option>
          <option>75%</option>
          <option>100%</option>
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="border px-4 py-2 rounded-lg">
            Cancel
          </button>
          <button
            onClick={() =>
              onConfirm({
                ...item,
                sugarLevel,
                quantity: 1,
              })
            }
            className="bg-brown-700 text-white px-4 py-2 rounded-lg"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
