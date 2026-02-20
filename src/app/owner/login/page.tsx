"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function OwnerLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // 🔥 Clear stale sessions (prevents refresh token bugs)
      await supabase.auth.signOut();

      // 1️⃣ Login
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) throw error;

      const user = data.user;

      console.log("Login user.id:", user.id);

      // 2️⃣ Fetch profile
      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

      if (profileError) throw profileError;

      // 3️⃣ If onboarding not completed → finish callback
      if (!profile) {
        router.push("/auth/callback");
        return;
      }

      // 4️⃣ Role-based redirect (future safe)
      if (profile.role === "owner") {
        router.push("/owner/dashboardOwner");
      } else {
        router.push("/");
      }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);

      if (err.message?.includes("Email not confirmed")) {
        setError(
          "Please confirm your email before logging in."
        );
      } else if (err.message?.includes("Invalid login")) {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto py-20">
      <h1 className="text-3xl font-bold mb-6">
        Owner Login
      </h1>

      {error && (
        <p className="text-red-600 mb-4">{error}</p>
      )}

      <input
        placeholder="Email"
        type="email"
        className="w-full mb-3 p-3 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        className="w-full mb-6 p-3 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-amber-700 text-white py-3 rounded"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </main>
  );
}
