"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import MenuCard from "@/app/components/MenuCard";
import type { MenuItem, CartItem } from "@/types/menu";

export default function QRMenuPage() {
  const router = useRouter();
  const params = useParams();

  const cafeId = typeof params?.id === "string" ? params.id : undefined;

  const [cafeName, setCafeName] = useState("");
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [sugarLevel, setSugarLevel] = useState("100%");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!cafeId) return;
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: cafe } = await supabase
          .from("cafes")
          .select("name")
          .eq("id", cafeId)
          .single();

        if (!cancelled && cafe) setCafeName(cafe.name);

        const { data, error } = await supabase
          .from("menus")
          .select("*")
          .eq("cafe_id", cafeId)
          .eq("is_available", true)
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

    fetchData();
    return () => { cancelled = true; };
  }, [cafeId]);

  const handleAddToCart = (item: MenuItem) => {
    setSelectedItem(item);
    setSugarLevel("100%");
    setQuantity(1);
  };

  const confirmAddToCart = () => {
    if (!selectedItem) return;
    const newItem: CartItem = { ...selectedItem, sugarLevel, quantity };
    setCart((prev) => [...prev, newItem]);
    setSelectedItem(null);
    setSugarLevel("100%");
    setQuantity(1);
  };

  const goToPayment = () => {
    if (!cafeId || cart.length === 0) return;
    localStorage.setItem("cart", JSON.stringify(cart));
    router.push(`/qr/cafes/${cafeId}/payment`);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;600&family=DM+Sans:wght@300;400;500&display=swap');

        .menu-page-root {
          min-height: 100vh;
          background: #F7F3EE;
          font-family: 'DM Sans', sans-serif;
          color: #1A0F00;
        }

        /* Header */
        .menu-page-header {
          background: #ffffff;
          border-bottom: 1px solid rgba(200,135,58,0.15);
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .header-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          font-weight: 600;
          color: #1A0F00;
          letter-spacing: 0.06em;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .logo-dot {
          width: 5px;
          height: 5px;
          background: #C8873A;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(200,135,58,0.5);
        }

        .header-cafe {
          font-size: 13px;
          color: rgba(26,15,0,0.4);
          font-weight: 300;
        }

        /* Content */
        .menu-page-content {
          max-width: 960px;
          margin: 0 auto;
          padding: 32px 24px 120px;
        }

        .menu-page-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 30px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 4px;
        }

        .menu-page-sub {
          font-size: 13px;
          color: rgba(26,15,0,0.35);
          font-weight: 300;
          margin-bottom: 28px;
        }

        .status-msg {
          font-size: 13px;
          color: rgba(26,15,0,0.35);
          padding: 32px 0;
          text-align: center;
        }

        .error-msg {
          font-size: 13px;
          color: #C03030;
          background: rgba(220,50,50,0.06);
          border: 1px solid rgba(220,50,50,0.15);
          padding: 10px 16px;
          border-radius: 10px;
          margin-bottom: 16px;
        }

        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }

        /* Cart button */
        .cart-btn {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: #C8873A;
          color: #ffffff;
          padding: 14px 32px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(200,135,58,0.35);
          transition: opacity 0.2s, transform 0.2s;
          white-space: nowrap;
          letter-spacing: 0.04em;
          z-index: 20;
        }

        .cart-btn:hover {
          opacity: 0.9;
          transform: translateX(-50%) translateY(-2px);
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26,15,0,0.4);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 50;
          padding: 0;
          backdrop-filter: blur(4px);
        }

        .modal-card {
          background: #ffffff;
          border-radius: 24px 24px 0 0;
          padding: 32px 28px 40px;
          width: 100%;
          max-width: 520px;
          box-shadow: 0 -8px 40px rgba(0,0,0,0.12);
          border-top: 1px solid rgba(200,135,58,0.15);
        }

        .modal-handle {
          width: 36px;
          height: 4px;
          background: rgba(26,15,0,0.1);
          border-radius: 2px;
          margin: 0 auto 24px;
        }

        .modal-item-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 4px;
        }

        .modal-item-price {
          font-size: 16px;
          color: #C8873A;
          font-weight: 500;
          margin-bottom: 24px;
        }

        .modal-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(26,15,0,0.45);
          margin-bottom: 8px;
        }

        .modal-select {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid rgba(200,135,58,0.2);
          border-radius: 10px;
          background: #F7F3EE;
          color: #1A0F00;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          margin-bottom: 24px;
          appearance: none;
          transition: border-color 0.2s;
        }

        .modal-select:focus {
          border-color: rgba(200,135,58,0.45);
        }

        /* Quantity picker */
        .qty-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #F7F3EE;
          border: 1px solid rgba(200,135,58,0.2);
          border-radius: 10px;
          padding: 6px 8px;
          margin-bottom: 24px;
        }

        .qty-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          background: #ffffff;
          color: #1A0F00;
          font-size: 18px;
          font-weight: 400;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          transition: background 0.15s, transform 0.1s;
          flex-shrink: 0;
          line-height: 1;
        }

        .qty-btn:hover:not(:disabled) {
          background: rgba(200,135,58,0.08);
          transform: scale(1.06);
        }

        .qty-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          transform: none;
        }

        .qty-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 600;
          color: #1A0F00;
          min-width: 40px;
          text-align: center;
          line-height: 1;
        }

        .qty-subtotal {
          font-size: 12px;
          color: #C8873A;
          font-weight: 500;
          min-width: 52px;
          text-align: right;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
        }

        .modal-cancel {
          flex: 1;
          padding: 13px;
          border-radius: 100px;
          border: 1px solid rgba(26,15,0,0.1);
          background: transparent;
          color: rgba(26,15,0,0.45);
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-cancel:hover {
          background: rgba(26,15,0,0.04);
        }

        .modal-confirm {
          flex: 2;
          padding: 13px;
          border-radius: 100px;
          border: none;
          background: #C8873A;
          color: #ffffff;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s;
          box-shadow: 0 4px 12px rgba(200,135,58,0.25);
          letter-spacing: 0.04em;
        }

        .modal-confirm:hover { opacity: 0.88; }
      `}</style>

      <div className="menu-page-root">
        {/* Sticky header */}
        <header className="menu-page-header">
          <div className="header-logo">
            <span className="logo-dot" />
            CafeBoost
          </div>
          {cafeName && <span className="header-cafe">{cafeName}</span>}
        </header>

        <div className="menu-page-content">
          <h1 className="menu-page-title">
            {cafeName ? `${cafeName}` : "Café Menu"}
          </h1>
          <p className="menu-page-sub">Browse our menu and add items to your order.</p>

          {loading && <p className="status-msg">Loading menu…</p>}
          {error && <div className="error-msg">{error}</div>}

          {!loading && !error && menu.length === 0 && (
            <p className="status-msg">No items available at this time.</p>
          )}

          {!loading && !error && menu.length > 0 && (
            <div className="menu-grid">
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
        </div>

        {/* Cart button — now counts total quantity across all items */}
        {cart.length > 0 && (
          <button onClick={goToPayment} className="cart-btn">
            View Order · {cartItemCount} {cartItemCount === 1 ? "item" : "items"} · ${cartTotal.toFixed(2)}
          </button>
        )}

        {/* Customization modal */}
        {selectedItem && (
          <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-handle" />
              <h2 className="modal-item-name">{selectedItem.name}</h2>
              <p className="modal-item-price">${selectedItem.price.toFixed(2)}</p>

              <label htmlFor="sugar-level" className="modal-label">Sugar Level</label>
              <select
                id="sugar-level"
                className="modal-select"
                value={sugarLevel}
                onChange={(e) => setSugarLevel(e.target.value)}
              >
                <option value="0%">0% — No sugar</option>
                <option value="25%">25% — Less sweet</option>
                <option value="50%">50% — Half sweet</option>
                <option value="75%">75% — Mostly sweet</option>
                <option value="100%">100% — Full sweet</option>
              </select>

              <label className="modal-label">Quantity</label>
              <div className="qty-row">
                <button
                  className="qty-btn"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  disabled={quantity >= 20}
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                >
                  +
                </button>
                <span className="qty-subtotal">
                  ${(selectedItem.price * quantity).toFixed(2)}
                </span>
              </div>

              <div className="modal-actions">
                <button onClick={() => setSelectedItem(null)} className="modal-cancel">
                  Cancel
                </button>
                <button onClick={confirmAddToCart} className="modal-confirm">
                  Add {quantity > 1 ? `${quantity}x ` : ""}to Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}