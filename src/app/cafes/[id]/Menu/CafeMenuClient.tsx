"use client";

import React, { useState } from "react";
import type { MenuItem } from "@/types/menu";
import type { CartItem } from "@/types/cart";
import MenuCard from "@/app/components/MenuCard";
import OptionModal from "@/app/components/OptionModal";
import CartDrawer from "@/app/components/CartDrawer";

type Props = {
  menu: MenuItem[];
};

export default function CafeMenuClient({ menu }: Props) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        {menu.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            isOrderEnabled
            onAddToCart={() => setSelectedItem(item)}
          />
        ))}
      </div>

      {selectedItem && (
        <OptionModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onConfirm={(item: CartItem) => {
            setCart((prev) => [...prev, item]);
            setSelectedItem(null);
          }}
        />
      )}

      <CartDrawer cart={cart} open={showCart} onToggle={() => setShowCart(!showCart)} />
    </>
  );
}