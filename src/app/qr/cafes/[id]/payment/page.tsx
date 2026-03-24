"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { CartItem } from "@/types/menu";

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();

  const cafeId = typeof params?.id === "string" ? params.id : undefined;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setMounted(true);
  }, []);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePayNow = async () => {
    if (!cafeId || cart.length === 0) return;

    if (!customerName.trim()) {
      alert("Please enter your name before confirming.");
      return;
    }

    try {
      setPlacing(true);

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          cafe_id: cafeId,
          customer_name: customerName.trim(),
          total,
          payment_method: paymentMethod,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const itemsToInsert = cart.map((item) => ({
        order_id: order.id,
        menu_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        notes: item.sugarLevel ?? null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      localStorage.removeItem("cart");
      setCart([]);
      router.push(`/qr/cafes/${cafeId}/confirmation`);
    } catch (err) {
      console.error("FULL ERROR:", JSON.stringify(err, null, 2));
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  // Group cart items by id + sugarLevel
  const groupedCart = Object.values(
    cart.reduce((acc, item) => {
      const key = `${item.id}-${item.sugarLevel}`;
      if (!acc[key]) {
        acc[key] = { ...item };
      } else {
        acc[key].quantity += item.quantity;
      }
      return acc;
    }, {} as Record<string, CartItem>)
  );

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;600&family=DM+Sans:wght@300;400;500&display=swap');

        .payment-root {
          min-height: 100vh;
          background: #F7F3EE;
          font-family: 'DM Sans', sans-serif;
          color: #1A0F00;
          padding: 48px 24px;
        }

        .payment-inner {
          max-width: 560px;
          margin: 0 auto;
        }

        .payment-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          font-weight: 600;
          color: #1A0F00;
          letter-spacing: 0.06em;
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 32px;
        }

        .logo-dot {
          width: 6px;
          height: 6px;
          background: #C8873A;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(200,135,58,0.4);
        }

        .payment-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 30px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 4px;
        }

        .payment-sub {
          font-size: 13px;
          color: rgba(26,15,0,0.4);
          font-weight: 300;
          margin-bottom: 28px;
        }

        .empty-state {
          text-align: center;
          padding: 48px 0;
          font-size: 13px;
          color: rgba(26,15,0,0.3);
        }

        /* Cart items */
        .cart-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }

        .cart-item {
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.12);
          border-radius: 14px;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          transition: border-color 0.2s;
        }

        .cart-item:hover {
          border-color: rgba(200,135,58,0.25);
        }

        .item-name {
          font-size: 14px;
          font-weight: 500;
          color: #1A0F00;
          margin-bottom: 3px;
        }

        .item-notes {
          font-size: 12px;
          color: rgba(26,15,0,0.35);
        }

        .item-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 600;
          color: #C8873A;
          white-space: nowrap;
          text-align: right;
        }

        .item-qty {
          font-size: 11px;
          color: rgba(26,15,0,0.35);
          text-align: right;
        }

        /* Total */
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.2);
          border-radius: 14px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }

        .total-label {
          font-size: 13px;
          font-weight: 500;
          color: rgba(26,15,0,0.5);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .total-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          color: #C8873A;
        }

        /* Form */
        .form-section {
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.12);
          border-radius: 18px;
          padding: 24px;
          margin-bottom: 20px;
        }

        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(26,15,0,0.45);
          margin-bottom: 8px;
        }

        .field-input {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid rgba(200,135,58,0.2);
          border-radius: 10px;
          background: #F7F3EE;
          color: #1A0F00;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          margin-bottom: 20px;
        }

        .field-input::placeholder {
          color: rgba(26,15,0,0.22);
        }

        .field-input:focus {
          border-color: rgba(200,135,58,0.45);
          box-shadow: 0 0 0 3px rgba(200,135,58,0.08);
          background: #ffffff;
        }

        .field-select {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid rgba(200,135,58,0.2);
          border-radius: 10px;
          background: #F7F3EE;
          color: #1A0F00;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          cursor: pointer;
          appearance: none;
        }

        .field-select:focus {
          border-color: rgba(200,135,58,0.45);
          box-shadow: 0 0 0 3px rgba(200,135,58,0.08);
          background: #ffffff;
        }

        /* Confirm button */
        .confirm-btn {
          width: 100%;
          padding: 15px;
          background: #C8873A;
          color: #ffffff;
          border: none;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 4px 16px rgba(200,135,58,0.3);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .confirm-btn:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .confirm-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }
      `}</style>

      <div className="payment-root">
        <div className="payment-inner">

          {/* Logo */}
          <div className="payment-logo">
            <span className="logo-dot" />
            CafeBoost
          </div>

          <h1 className="payment-title">Order Summary</h1>
          <p className="payment-sub">Review your items and confirm payment.</p>

          {cart.length === 0 ? (
            <p className="empty-state">Your cart is empty.</p>
          ) : (
            <>
              {/* Cart items */}
              <div className="cart-list">
                {groupedCart.map((item, index) => (
                  <div key={`${item.id}-${item.sugarLevel}-${index}`} className="cart-item">
                    <div>
                      <p className="item-name">{item.name}</p>
                      <p className="item-notes">
                        Notes: {item.sugarLevel || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="item-price">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="item-qty">${item.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="total-row">
                <span className="total-label">Total</span>
                <span className="total-value">${total.toFixed(2)}</span>
              </div>

              {/* Form */}
              <div className="form-section">
               

                <label htmlFor="payment-method" className="field-label">Payment Method</label>
                <select
                  id="payment-method"
                  className="field-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="khqr">KHQR</option>
                  <option value="aba">ABA Pay</option>
                </select>
              </div>

              {/* Confirm button */}
              <button
                onClick={handlePayNow}
                disabled={placing}
                className="confirm-btn"
              >
                {placing ? "Placing Order..." : "Confirm & Pay"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}