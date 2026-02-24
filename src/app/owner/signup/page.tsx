"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { AuthApiError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function OwnerSignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignup = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // 1️⃣ Create auth user
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      const user = data.user;
      if (!user) throw new Error("Signup failed. Please try again.");

      // 2️⃣ Create profiles row
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          name: name,
          role: "owner",
          cafe_id: null,
        });

      if (profileError) throw profileError;

      // 3️⃣ Store credentials so setup-cafe can re-authenticate
      sessionStorage.setItem("setupEmail", email);
      sessionStorage.setItem("setupPassword", password);

      setSuccess("Account created! Redirecting to café setup...");

      setTimeout(() => {
        router.push(`/owner/setup-cafe?uid=${user.id}`);
      }, 1000);

    } catch (err) {
      console.error("SIGNUP ERROR FULL:", JSON.stringify(err, null, 2));

      if (err instanceof AuthApiError) {
        if (err.status === 429) {
          setError("Too many signup attempts. Please wait a few minutes.");
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
        placeholder="Your Name"
        className="w-full mb-3 p-3 border rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
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