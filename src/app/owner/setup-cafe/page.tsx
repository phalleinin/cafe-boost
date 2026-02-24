"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function SetupCafePage() {
  const [cafeName, setCafeName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get("uid");

    if (!uid) {
      window.location.href = "/owner/signup";
      return;
    }

    setUserId(uid);

    const checkProfile = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("cafe_id")
        .eq("id", uid)
        .single();

      if (profile?.cafe_id) {
        window.location.href = "/owner/dashboard";
      }
    };

    checkProfile();
  }, []);

  const handleSetup = async () => {
    if (!cafeName.trim()) {
      setError("Café name is required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1️⃣ Re-authenticate using credentials stored during signup
      const storedEmail = sessionStorage.getItem("setupEmail");
      const storedPassword = sessionStorage.getItem("setupPassword");

      console.log("storedEmail:", storedEmail);       // ✅ debug
      console.log("storedPassword:", storedPassword); // ✅ debug

      if (!storedEmail || !storedPassword) {
        throw new Error("Session expired. Please sign up again.");
      }

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: storedEmail,
        password: storedPassword,
      });

      if (signInError) throw new Error(signInError.message);

      const user = authData.user;
      if (!user) throw new Error("Authentication failed.");

      // ✅ Verify session is active
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session after signIn:", session?.user?.id); // ✅ debug

      if (!session) throw new Error("Session not established after sign in.");

      // ✅ Clean up credentials immediately after use
      sessionStorage.removeItem("setupEmail");
      sessionStorage.removeItem("setupPassword");

      // 2️⃣ Create the cafe row
      const { error: cafeError } = await supabase
          .from("cafes")
          .insert({
            name: cafeName.trim(),
            address: address.trim() || null,
            description: description.trim() || null,
            status: "active",
          });

        if (cafeError) throw new Error(cafeError.message);

        // Fetch the cafe separately to get the id
        const { data: cafe, error: fetchError } = await supabase
          .from("cafes")
          .select("id")
          .eq("owner_id", authData.user.id)
          .single();

        if (fetchError) throw new Error(fetchError.message);
      // 3️⃣ Update profiles.cafe_id
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ cafe_id: cafe.id })
        .eq("id", user.id);

      if (profileError) throw new Error(profileError.message);

      // 4️⃣ Redirect to dashboard
      window.location.href = "/owner/dashboard";

    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("SETUP ERROR:", err.message);
        setError(err.message);
      } else {
        console.error("SETUP ERROR UNKNOWN:", JSON.stringify(err, null, 2));
        setError("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto py-20">
      <h1 className="text-3xl font-bold mb-2">Set Up Your Café</h1>
      <p className="text-gray-500 mb-6">
        Tell us about your café to get started.
      </p>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <input
        placeholder="Café Name *"
        className="w-full mb-3 p-3 border rounded"
        value={cafeName}
        onChange={(e) => setCafeName(e.target.value)}
        required
      />

      <input
        placeholder="Address (optional)"
        className="w-full mb-3 p-3 border rounded"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <textarea
        placeholder="Description (optional)"
        className="w-full mb-6 p-3 border rounded resize-none"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button
        onClick={handleSetup}
        disabled={loading}
        className="w-full bg-amber-700 text-white py-3 rounded"
      >
        {loading ? "Setting up..." : "Launch My Café"}
      </button>
    </main>
  );
}