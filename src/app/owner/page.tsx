"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function OwnerPage() {
  useEffect(() => {
    const check = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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
        window.location.href = "/owner/orders";
      }
    };

    void check();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      Loading...
    </div>
  );
}