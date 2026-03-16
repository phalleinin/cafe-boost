"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

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
      window.location.href = "/auth/signup"; // redirect if no uid
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

      const storedEmail = sessionStorage.getItem("setupEmail");
      const storedPassword = sessionStorage.getItem("setupPassword");

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

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session not established after sign in.");

      sessionStorage.removeItem("setupEmail");
      sessionStorage.removeItem("setupPassword");

      const { error: cafeError } = await supabase
        .from("cafes")
        .insert({
          name: cafeName.trim(),
          address: address.trim() || null,
          description: description.trim() || null,
          status: "active",
        });

      if (cafeError) throw new Error(cafeError.message);

      const { data: cafe, error: fetchError } = await supabase
        .from("cafes")
        .select("id")
        .eq("owner_id", authData.user.id)
        .single();

      if (fetchError) throw new Error(fetchError.message);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ cafe_id: cafe.id })
        .eq("id", user.id);

      if (profileError) throw new Error(profileError.message);

      window.location.href = "/owner/dashboard";

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .setup-root {
          min-height: 100vh;
          background: #F7F3EE;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
        }

        .setup-nav {
          padding: 20px 48px;
          border-bottom: 1px solid rgba(200,135,58,0.15);
          background: #ffffff;
          display: flex;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .nav-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 600;
          color: #1A0F00;
          letter-spacing: 0.06em;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-dot {
          width: 6px;
          height: 6px;
          background: #C8873A;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(200,135,58,0.4);
        }

        .setup-body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
        }

        .setup-card {
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.15);
          border-radius: 24px;
          padding: 48px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }

        .setup-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C8873A;
          margin-bottom: 8px;
        }

        .setup-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 6px;
          letter-spacing: 0.02em;
        }

        .setup-sub {
          font-size: 13px;
          color: rgba(26,15,0,0.4);
          font-weight: 300;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(26,15,0,0.5);
          margin-bottom: 6px;
        }

        .field-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid rgba(200,135,58,0.2);
          border-radius: 10px;
          background: #F7F3EE;
          color: #1A0F00;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
          margin-bottom: 20px;
          outline: none;
        }

        .field-input::placeholder {
          color: rgba(26,15,0,0.25);
        }

        .field-input:focus {
          border-color: rgba(200,135,58,0.5);
          box-shadow: 0 0 0 3px rgba(200,135,58,0.08);
          background: #ffffff;
        }

        .field-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid rgba(200,135,58,0.2);
          border-radius: 10px;
          background: #F7F3EE;
          color: #1A0F00;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
          margin-bottom: 20px;
          outline: none;
          resize: none;
        }

        .field-textarea::placeholder {
          color: rgba(26,15,0,0.25);
        }

        .field-textarea:focus {
          border-color: rgba(200,135,58,0.5);
          box-shadow: 0 0 0 3px rgba(200,135,58,0.08);
          background: #ffffff;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #C8873A;
          color: #ffffff;
          border: none;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: opacity 0.2s, transform 0.2s;
          margin-top: 4px;
        }

        .submit-btn:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-msg {
          background: rgba(220,50,50,0.06);
          border: 1px solid rgba(220,50,50,0.15);
          color: #C03030;
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .step-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 28px;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .step-num {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
        }

        .step.done .step-num {
          background: rgba(200,135,58,0.15);
          color: #C8873A;
        }

        .step.done .step-label {
          color: rgba(26,15,0,0.3);
        }

        .step.active .step-num {
          background: #C8873A;
          color: #ffffff;
        }

        .step.active .step-label {
          color: #C8873A;
          font-weight: 500;
        }

        .step-divider {
          flex: 1;
          height: 1px;
          background: rgba(200,135,58,0.2);
        }
      `}</style>

      <div className="setup-root">
        {/* Nav */}
        <nav className="setup-nav">
          <Link href="/" className="nav-logo">
            <span className="nav-dot" />
            CafeBoost
          </Link>
        </nav>

        {/* Body */}
        <div className="setup-body">
          <div className="setup-card">

            {/* Step indicator */}
            <div className="step-indicator">
              <div className="step done">
                <span className="step-num">✓</span>
                <span className="step-label">Account</span>
              </div>
              <div className="step-divider" />
              <div className="step active">
                <span className="step-num">2</span>
                <span className="step-label">Café Setup</span>
              </div>
            </div>

            <p className="setup-eyebrow">Step 2 of 2</p>
            <h1 className="setup-title">Set Up Your Café</h1>
            <p className="setup-sub">
              Tell us about your café. You can update these details later from your dashboard.
            </p>

            {error && <div className="error-msg">{error}</div>}

            <label htmlFor="cafe-name" className="field-label">Café Name *</label>
            <input
              id="cafe-name"
              type="text"
              placeholder="e.g. Sunrise Coffee"
              className="field-input"
              value={cafeName}
              onChange={(e) => setCafeName(e.target.value)}
              required
            />

            <label htmlFor="cafe-address" className="field-label">Address</label>
            <input
              id="cafe-address"
              type="text"
              placeholder="e.g. 123 Main Street (optional)"
              className="field-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <label htmlFor="cafe-description" className="field-label">Description</label>
            <textarea
              id="cafe-description"
              placeholder="Tell customers what makes your café special (optional)"
              className="field-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button
              onClick={handleSetup}
              disabled={loading || !userId}
              className="submit-btn"
            >
              {loading ? "Setting up..." : "Launch My Café →"}
            </button>

          </div>
        </div>
      </div>
    </>
  );
}