"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { QRCodeCanvas } from "qrcode.react";

export default function MenuQRPage() {
  const [cafeId, setCafeId] = useState<string | null>(null);
  const [cafeName, setCafeName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = "/owner/login";
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("cafe_id")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        if (!profile?.cafe_id) {
          window.location.href = "/owner/setup-cafe";
          return;
        }

        // ✅ Get cafe name for display
        const { data: cafe, error: cafeError } = await supabase
          .from("cafes")
          .select("name")
          .eq("id", profile.cafe_id)
          .single();

        if (cafeError) throw cafeError;

        setCafeId(profile.cafe_id);
        setCafeName(cafe?.name || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load café info");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ✅ Build the public menu URL
  const menuUrl = cafeId
    ? `${window.location.origin}/qr/cafes/${cafeId}/menu`
    : "";

  // ✅ Download QR as PNG
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
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <section className="max-w-xl mx-auto px-6 py-12 text-center">

        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Your Menu QR Code
        </h1>
        <p className="text-gray-500 mb-8">
          Print or display this QR code so customers can scan and order directly.
        </p>

        {/* QR Code */}
        <div
          ref={qrRef}
          className="inline-block bg-white p-6 rounded-2xl shadow-lg mb-6"
        >
          {menuUrl && (
            <QRCodeCanvas
              value={menuUrl}
              size={240}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
            />
          )}
        </div>

        {/* Cafe name + URL info */}
        <p className="text-lg font-semibold mb-1">{cafeName}</p>
        <p className="text-sm text-gray-400 break-all mb-8">{menuUrl}</p>

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleDownload}
            className="bg-linear-to-r from-amber-600 to-amber-800 text-white px-8 py-3 rounded-full shadow-lg hover:opacity-90 transition"
          >
            Download QR
          </button>
          <button
            onClick={() => window.open(menuUrl, "_blank")}
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-full hover:bg-gray-100 transition"
          >
            Preview Menu
          </button>
        </div>

      </section>
    </main>
  );
}