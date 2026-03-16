"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function OwnerIndexPage() {
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/owner/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("cafe_id")
        .eq("id", user.id)
        .single();

      if (!profile?.cafe_id) {
        window.location.href = "/owner/setup-cafe";
      } else {
        window.location.href = "/owner/dashboard";
      }
    };

    check();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0E0A07",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      color: "rgba(245,230,208,0.4)"
    }}>
      Redirecting...
    </div>
  );
}