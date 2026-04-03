"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { QRCodeCanvas } from "qrcode.react";
import { useLocale } from "@/i18n/locale-context";

export default function MenuQRPage() {
  const { t } = useLocale();

  const [cafeId, setCafeId] = useState<string | null>(null);
  const [cafeName, setCafeName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = "/auth/signin";
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("cafe_id")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (!profile?.cafe_id) {
          window.location.href = "/auth/setup-cafe";
          return;
        }

        const { data: cafe, error: cafeError } = await supabase
          .from("cafes")
          .select("name")
          .eq("id", profile.cafe_id)
          .single();

        if (cafeError) throw cafeError;

        setCafeId(profile.cafe_id);
        setCafeName(cafe?.name || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : t.menuQR.failedToLoadCafeInfo);
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [t.menuQR.failedToLoadCafeInfo]);

  const menuUrl =
    typeof window !== "undefined" && cafeId
      ? `${window.location.origin}/qr/cafes/${cafeId}/menu`
      : "";

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${cafeName || "cafe"}-menu-qr.png`;
    link.click();
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          fontFamily: "'DM Sans', 'Noto Sans Khmer', sans-serif",
          color: "rgba(26,15,0,0.35)",
        }}
      >
        {t.menuQR.loading}
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          fontFamily: "'DM Sans', 'Noto Sans Khmer', sans-serif",
          color: "#C03030",
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;600&family=DM+Sans:wght@300;400;500&family=Noto+Sans+Khmer:wght@300;400;500;600;700&display=swap');

        .qr-root {
          font-family: 'DM Sans', 'Noto Sans Khmer', sans-serif;
          color: #1A0F00;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
        }

        .khmer-text {
          font-family: 'Noto Sans Khmer', 'DM Sans', sans-serif;
        }

        .qr-page-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 6px;
          text-align: center;
        }

        .qr-page-sub {
          font-size: 13px;
          color: rgba(26,15,0,0.4);
          font-weight: 300;
          margin-bottom: 40px;
          text-align: center;
          max-width: 400px;
        }

        .qr-card {
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.15);
          border-radius: 24px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          margin-bottom: 28px;
          width: 100%;
          max-width: 380px;
        }

        .qr-canvas-wrap {
          background: #ffffff;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid rgba(200,135,58,0.12);
          margin-bottom: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        .qr-cafe-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 6px;
          text-align: center;
        }

        .qr-url {
          font-size: 11px;
          color: rgba(26,15,0,0.3);
          word-break: break-all;
          text-align: center;
          letter-spacing: 0.02em;
          max-width: 280px;
        }

        .qr-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .qr-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #C8873A;
          color: #ffffff;
          padding: 12px 28px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', 'Noto Sans Khmer', sans-serif;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 4px 12px rgba(200,135,58,0.25);
          letter-spacing: 0.04em;
        }

        .qr-btn-primary:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .qr-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          color: rgba(26,15,0,0.6);
          padding: 12px 28px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', 'Noto Sans Khmer', sans-serif;
          border: 1px solid rgba(200,135,58,0.2);
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.04em;
        }

        .qr-btn-secondary:hover {
          border-color: rgba(200,135,58,0.4);
          color: #C8873A;
          background: rgba(200,135,58,0.04);
        }

        .qr-btn-secondary:disabled,
        .qr-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .qr-hint {
          margin-top: 24px;
          font-size: 12px;
          color: rgba(26,15,0,0.25);
          text-align: center;
          max-width: 320px;
          line-height: 1.6;
        }
      `}</style>

      <div className="qr-root">
        <h1 className={`qr-page-title ${t.meta.isKhmer ? "khmer-text" : ""}`}>
          {t.menuQR.title}
        </h1>

        <p className={`qr-page-sub ${t.meta.isKhmer ? "khmer-text" : ""}`}>
          {t.menuQR.subtitle}
        </p>

        <div className="qr-card">
          <div ref={qrRef} className="qr-canvas-wrap">
            {menuUrl && (
              <QRCodeCanvas
                value={menuUrl}
                size={220}
                bgColor="#ffffff"
                fgColor="#1A0F00"
                level="H"
              />
            )}
          </div>

          <p className="qr-cafe-name">{cafeName}</p>
          <p className="qr-url">{menuUrl}</p>
        </div>

        <div className="qr-actions">
          <button onClick={handleDownload} className="qr-btn-primary" disabled={!menuUrl}>
            ↓ {t.menuQR.downloadQr}
          </button>

          <button
            onClick={() => window.open(menuUrl, "_blank")}
            className="qr-btn-secondary"
            disabled={!menuUrl}
          >
            ↗ {t.menuQR.previewMenu}
          </button>
        </div>

        <p className={`qr-hint ${t.meta.isKhmer ? "khmer-text" : ""}`}>
          {t.menuQR.hint}
        </p>
      </div>
    </>
  );
}