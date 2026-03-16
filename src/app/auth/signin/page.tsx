"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

      await supabase.auth.signOut();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const user = data.user;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        router.push(`/auth/setup-cafe?uid=${user.id}`);
        return;
      }

      if (profile.role === "owner") {
        if (!profile.cafe_id) {
          router.push(`/auth/setup-cafe?uid=${user.id}`); // ✅ fixed path
        } else {
          router.push("/owner/dashboard");
        }
      } else if (profile.role === "barista") {
        router.push("/barista/dashboard");
      }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);

      if (err.message?.includes("Email not confirmed")) {
        setError("Please confirm your email before logging in.");
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          background: #F7F3EE;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
        }

        .login-nav {
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

        .login-body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
        }

        .login-card {
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.15);
          border-radius: 24px;
          padding: 48px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }

        .login-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C8873A;
          margin-bottom: 8px;
        }

        .login-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 6px;
          letter-spacing: 0.02em;
        }

        .login-sub {
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

        .signup-link {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: rgba(26,15,0,0.4);
        }

        .signup-link a {
          color: #C8873A;
          text-decoration: none;
          font-weight: 500;
        }

        .signup-link a:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="login-root">
        {/* Nav */}
        <nav className="login-nav">
          <Link href="/" className="nav-logo">
            <span className="nav-dot" />
            CafeBoost
          </Link>
        </nav>

        {/* Body */}
        <div className="login-body">
          <div className="login-card">
            <p className="login-eyebrow">Owner Portal</p>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-sub">Sign in to manage your café.</p>

            {error && <div className="error-msg">{error}</div>}

            <label htmlFor="login-email" className="field-label">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="login-password" className="field-label">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Your password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={handleLogin}
              disabled={loading}
              className="submit-btn"
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>

            <p className="signup-link">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}