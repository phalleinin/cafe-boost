"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { AuthApiError } from "@supabase/supabase-js";

export default function OwnerSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cafeName, setCafeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignup = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // 🔥 Clear any stale session
      await supabase.auth.signOut();

      // 1️⃣ Store cafe name temporarily for callback onboarding
      localStorage.setItem("pendingCafeName", cafeName);

      // 2️⃣ Create auth user only
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      // 3️⃣ Email confirmation required scenario
      if (!data.user) {
        setSuccess(
          "Account created! Please check your email to confirm your cafe account."
        );
        return;
      }

      // ⚠️ If email confirmation is OFF (dev mode)
      setSuccess(
        "Account created successfully! Redirecting to dashboard..."
      );

      // Small delay for UX
      setTimeout(() => {
        window.location.href = "/owner/dashboardOwner";
      }, 1500);

    } catch (err) {
      console.error("SIGNUP ERROR:", err);

      if (err instanceof AuthApiError) {
        if (err.status === 429) {
          setError(
            "Too many signup attempts. Please wait a few minutes."
          );
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto py-20">
      <h1 className="text-3xl font-bold mb-6">Owner Sign Up</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      <input
        placeholder="Cafe Name"
        className="w-full mb-3 p-3 border rounded"
        value={cafeName}
        onChange={(e) => setCafeName(e.target.value)}
        required
      />

      <input
        placeholder="Email"
        type="email"
        className="w-full mb-3 p-3 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        placeholder="Password"
        type="password"
        className="w-full mb-6 p-3 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        onClick={handleSignup}
        disabled={loading}
        className="w-full bg-amber-700 text-white py-3 rounded"
      >
        {loading ? "Creating account..." : "Create Cafe Account"}
      </button>
    </main>
  );
}
