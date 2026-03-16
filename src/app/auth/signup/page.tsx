"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { AuthApiError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      const user = data.user;
      if (!user) throw new Error("Signup failed. Please try again.");

      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          name: name,
          role: "owner",
          cafe_id: null,
        });

      if (profileError) throw profileError;

      sessionStorage.setItem("setupEmail", email);
      sessionStorage.setItem("setupPassword", password);

      setSuccess("Account created! Redirecting to café setup...");

      setTimeout(() => {
        router.push(`/auth/setup-cafe?uid=${user.id}`);
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .signup-root {
          min-height: 100vh;
          background: #F7F3EE;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
        }

        .signup-nav {
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

        .signup-body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
        }

        .signup-card {
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.15);
          border-radius: 24px;
          padding: 48px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }

        .signup-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C8873A;
          margin-bottom: 8px;
        }

        .signup-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 6px;
          letter-spacing: 0.02em;
        }

        .signup-sub {
          font-size: 13px;
          color: rgba(26,15,0,0.4);
          font-weight: 300;
          margin-bottom: 32px;
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

        .success-msg {
          background: rgba(40,160,90,0.06);
          border: 1px solid rgba(40,160,90,0.15);
          color: #1A8A50;
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .login-link {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: rgba(26,15,0,0.4);
        }

        .login-link a {
          color: #C8873A;
          text-decoration: none;
          font-weight: 500;
        }

        .login-link a:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="signup-root">
        {/* Nav */}
        <nav className="signup-nav">
          <Link href="/" className="nav-logo">
            <span className="nav-dot" />
            CafeBoost
          </Link>
        </nav>

        {/* Body */}
        <div className="signup-body">
          <div className="signup-card">
            <p className="signup-eyebrow">Get Started</p>
            <h1 className="signup-title">Create Account</h1>
            <p className="signup-sub">Set up your café owner account in seconds.</p>

            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}

            <label htmlFor="signup-name" className="field-label">Your Name</label>
            <input
              id="signup-name"
              type="text"
              placeholder="e.g. John Smith"
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label htmlFor="signup-email" className="field-label">Email</label>
            <input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="signup-password" className="field-label">Password</label>
            <input
              id="signup-password"
              type="password"
              placeholder="Min. 6 characters"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              onClick={handleSignup}
              disabled={loading}
              className="submit-btn"
            >
              {loading ? "Creating account..." : "Create Café Account"}
            </button>

            <p className="login-link">
              Already have an account?{" "}
              <Link href="/auth/signin">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}