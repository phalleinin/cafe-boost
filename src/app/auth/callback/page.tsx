"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      // 🔥 Ensure session exchange completes
      await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile) {
        const cafeName =
          localStorage.getItem("pendingCafeName") ||
          `${user.email}'s Cafe`;

        // Create cafe
        const { data: cafe, error: cafeError } = await supabase
          .from("cafes")
          .insert({ name: cafeName })
          .select()
          .single();

        if (cafeError) {
          console.error(cafeError);
          return;
        }

        // Create profile
        await supabase.from("profiles").insert({
          id: user.id,
          role: "owner",
          cafe_id: cafe.id,
        });

        localStorage.removeItem("pendingCafeName");
      }

      router.push("/owner/dashboard");
    };

    run();
  }, [router]);

  return <p>Confirming your account...</p>;
}
