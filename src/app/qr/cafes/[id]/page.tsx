"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { QRCodeCanvas } from "qrcode.react";

export default function QRDisplayPage() {
  const params = useParams();
  const router = useRouter();
  const cafeId = typeof params?.id === "string" ? params.id : undefined;

  const [cafeName, setCafeName] = useState("Loading...");
  const [menuUrl, setMenuUrl] = useState("");

  useEffect(() => {
    if (!cafeId) return;

    const fetchCafe = async () => {
      const { data, error } = await supabase
        .from("cafes")
        .select("name")
        .eq("id", cafeId)
        .single();

      if (!error && data) {
        setCafeName(data.name);
      } else {
        setCafeName("Café");
      }

      // ✅ Set menuUrl inside the effect — safe to access window here
      setMenuUrl(`${window.location.origin}/qr/cafes/${cafeId}/menu`);
    };

    fetchCafe();
  }, [cafeId]);



  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;600&family=DM+Sans:wght@300;400;500&display=swap');

        .qr-display-root {
          min-height: 100vh;
          background: #F7F3EE;
          font-family: 'DM Sans', sans-serif;
          color: #1A0F00;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
        }

        .qr-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 600;
          color: #1A0F00;
          letter-spacing: 0.06em;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 40px;
        }

        .qr-logo-dot {
          width: 6px;
          height: 6px;
          background: #C8873A;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(200,135,58,0.4);
        }

        .qr-cafe-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 8px;
          text-align: center;
        }

        .qr-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C8873A;
          margin-bottom: 32px;
          text-align: center;
        }

        .qr-card {
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.15);
          border-radius: 24px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          margin-bottom: 28px;
        }

        .qr-canvas-wrap {
          background: #ffffff;
          padding: 16px;
          border-radius: 14px;
          border: 1px solid rgba(200,135,58,0.1);
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .qr-loading {
          font-size: 13px;
          color: rgba(26,15,0,0.35);
          padding: 32px;
        }

        .qr-instruction {
          font-size: 13px;
          color: rgba(26,15,0,0.4);
          text-align: center;
          max-width: 280px;
          line-height: 1.6;
          margin-bottom: 28px;
        }

        .view-menu-btn {
          background: #C8873A;
          color: #ffffff;
          padding: 14px 40px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 4px 16px rgba(200,135,58,0.3);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .view-menu-btn:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
      `}</style>

      <div className="qr-display-root">
        {/* Logo */}
        <div className="qr-logo">
          <span className="qr-logo-dot" />
          CafeBoost
        </div>

        {/* Cafe name */}
        <p className="qr-eyebrow">Welcome to</p>
        <h1 className="qr-cafe-name">{cafeName}</h1>

        {/* QR Card */}
        <div className="qr-card">
          <div className="qr-canvas-wrap">
            { menuUrl ? (
              <QRCodeCanvas
                value={menuUrl}
                size={220}
                bgColor="#ffffff"
                fgColor="#1A0F00"
                level="H"
                includeMargin={false}
              />
            ) : (
              <p className="qr-loading">Loading QR...</p>
            )}
          </div>
        </div>

        {/* Instruction */}
        <p className="qr-instruction">
          Scan the QR code with your phone camera to view the menu and place your order.
        </p>

        {/* Fallback button */}
        <button
          onClick={() => router.push(`/qr/cafes/${cafeId}/menu`)}
          className="view-menu-btn"
        >
          View Menu
        </button>
      </div>
    </>
  );
}