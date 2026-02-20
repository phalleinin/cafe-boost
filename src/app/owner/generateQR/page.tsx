"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { QRCodeCanvas } from "qrcode.react";

export default function OwnerMenuQRPage() {
  const [cafeName, setCafeName] = useState("Loading...");
  const [menuUrl, setMenuUrl] = useState("");

  useEffect(() => {
    // Example: fetch café info (adjust if you have cafeId stored in auth/session)
    const fetchCafe = async () => {
      const { data } = await supabase.from("cafes").select("id, name").single();
      if (data) {
        setCafeName(data.name);
        if (typeof window !== "undefined") {
          setMenuUrl(`${window.location.origin}/qr/cafes/${data.id}/menu`);
        }
      }
    };
    fetchCafe();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-white to-gray-50 px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">QR Code for {cafeName}</h1>

      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
        {menuUrl ? (
          <QRCodeCanvas
            value={menuUrl}
            size={256}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            includeMargin={true}
          />
        ) : (
          <span className="text-red-500 font-medium">
            QR cannot be generated until your menu is ready.
          </span>
        )}
      </div>

      <p className="text-center text-gray-600 mb-8">
        Customers can scan this QR code to view your menu.
      </p>

      <a
        href={menuUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-linear-to-r from-amber-600 to-amber-800 text-white px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition"
      >
        Preview Menu
      </a>
    </main>
  );
}
