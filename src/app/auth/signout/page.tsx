"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function SignOutPage() {
  useEffect(() => {
    const signOut = async () => {
      await supabase.auth.signOut();
      window.location.href = "/";
    };

    signOut();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;600&family=DM+Sans:wght@300;400&display=swap');

        .signout-root {
          min-height: 100vh;
          background: #F7F3EE;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
        }

        .signout-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          color: #1A0F00;
          letter-spacing: 0.06em;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .signout-dot {
          width: 6px;
          height: 6px;
          background: #C8873A;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(200,135,58,0.4);
        }

        .signout-text {
          font-size: 13px;
          color: rgba(26,15,0,0.4);
          font-weight: 300;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(200,135,58,0.2);
          border-top-color: #C8873A;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="signout-root">
        <div className="signout-logo">
          <span className="signout-dot" />
          CafeBoost
        </div>
        <div className="spinner" />
        <p className="signout-text">Signing you out...</p>
      </div>
    </>
  );
}