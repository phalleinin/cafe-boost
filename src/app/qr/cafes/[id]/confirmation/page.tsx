"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function ConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cafeId = typeof params?.id === "string" ? params.id : undefined;

  // order_id is passed as a query param from the checkout page: ?order_id=xxx
  const orderId = searchParams.get("order_id");

  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [loadingNumber, setLoadingNumber] = useState(true);

  useEffect(() => {
    if (!orderId) { setLoadingNumber(false); return; }

    const fetch = async () => {
      const { data } = await supabase
        .from("orders")
        .select("order_number")
        .eq("id", orderId)
        .single();

      setOrderNumber(data?.order_number ?? null);
      setLoadingNumber(false);
    };

    void fetch();
  }, [orderId]);

  const formattedNumber = orderNumber != null
    ? `#${String(orderNumber).padStart(3, "0")}`
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;600&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .confirm-root {
          min-height: 100vh;
          background: #F7F3EE;
          font-family: 'DM Sans', sans-serif;
          color: #1A0F00;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
        }

        .confirm-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          font-weight: 600;
          color: #1A0F00;
          letter-spacing: 0.06em;
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 40px;
        }

        .logo-dot {
          width: 6px;
          height: 6px;
          background: #C8873A;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(200,135,58,0.4);
        }

        .confirm-card {
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.15);
          border-radius: 24px;
          padding: 40px 32px;
          max-width: 380px;
          width: 100%;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* success checkmark */
        .confirm-icon {
          width: 56px;
          height: 56px;
          background: rgba(40,160,90,0.1);
          border: 1px solid rgba(40,160,90,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 16px;
          color: #1A8A50;
        }

        .confirm-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 6px;
        }

        .confirm-sub {
          font-size: 13px;
          color: rgba(26,15,0,0.4);
          font-weight: 300;
          line-height: 1.6;
          margin-bottom: 28px;
        }

        /* order number block — the hero element */
        .order-number-block {
          background: #1A0F00;
          border-radius: 16px;
          padding: 24px 32px;
          width: 100%;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .order-number-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
        }

        .order-number-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 64px;
          font-weight: 600;
          color: #C8873A;
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .order-number-hint {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          margin-top: 4px;
        }

        /* skeleton while loading */
        .order-number-skeleton {
          width: 120px;
          height: 64px;
          background: rgba(255,255,255,0.08);
          border-radius: 8px;
          animation: shimmer 1.2s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%,100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        .divider {
          width: 100%;
          height: 1px;
          background: rgba(200,135,58,0.1);
          margin-bottom: 20px;
        }

        /* live status */
        .status-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(26,15,0,0.5);
          margin-bottom: 24px;
          text-align: left;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #C8873A;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
          flex-shrink: 0;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        /* buttons */
        .back-btn {
          width: 100%;
          padding: 13px;
          background: #C8873A;
          color: #ffffff;
          border: none;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 4px 14px rgba(200,135,58,0.25);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .back-btn:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .secondary-btn {
          width: 100%;
          padding: 13px;
          background: transparent;
          color: rgba(26,15,0,0.45);
          border: 1px solid rgba(26,15,0,0.1);
          border-radius: 100px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.04em;
        }

        .secondary-btn:hover {
          background: rgba(26,15,0,0.04);
          color: #1A0F00;
        }
      `}</style>

      <div className="confirm-root">
        <div className="confirm-logo">
          <span className="logo-dot" />
          CafeBoost
        </div>

        <div className="confirm-card">
          <div className="confirm-icon">✓</div>
          <h1 className="confirm-title">Order Placed!</h1>
          <p className="confirm-sub">
            Your order has been received.<br />Remember your order number below.
          </p>

          {/* ── Order number — hero element ── */}
          <div className="order-number-block">
            <p className="order-number-label">Your Order Number</p>
            {loadingNumber ? (
              <div className="order-number-skeleton" />
            ) : formattedNumber ? (
              <p className="order-number-value">{formattedNumber}</p>
            ) : (
              <p className="order-number-value" style={{ fontSize: "32px", color: "rgba(255,255,255,0.3)" }}>
                —
              </p>
            )}
            <p className="order-number-hint">We will call this number when ready</p>
          </div>

          <div className="divider" />

          <div className="status-row">
            <span className="status-dot" />
            Your order is being prepared. Thank you!
          </div>

          <button
            onClick={() => router.push(`/qr/cafes/${cafeId}/menu`)}
            className="back-btn"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </>
  );
}