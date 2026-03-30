"use client";

import { useParams, useRouter } from "next/navigation";

export default function ConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const cafeId = typeof params?.id === "string" ? params.id : undefined;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;600&family=DM+Sans:wght@300;400;500&display=swap');

        .confirm-root {
          min-height: 100vh;
          background: #F7F3EE;
          font-family: 'DM Sans', sans-serif;
          color: #1A0F00;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
        }

        .confirm-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          font-weight: 600;
          color: #1A0F00;
          letter-spacing: 0.06em;
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 48px;
        }

        .logo-dot {
          width: 6px;
          height: 6px;
          background: #C8873A;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(200,135,58,0.4);
        }

        .confirm-card {
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.15);
          border-radius: 24px;
          padding: 48px 40px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .confirm-icon {
          width: 64px;
          height: 64px;
          background: rgba(40,160,90,0.1);
          border: 1px solid rgba(40,160,90,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin-bottom: 24px;
        }

        .confirm-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 30px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 10px;
        }

        .confirm-sub {
          font-size: 13px;
          color: rgba(26,15,0,0.45);
          font-weight: 300;
          line-height: 1.7;
          margin-bottom: 32px;
          max-width: 280px;
        }

        .divider {
          width: 100%;
          height: 1px;
          background: rgba(200,135,58,0.1);
          margin-bottom: 24px;
        }

        .status-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(26,15,0,0.5);
          margin-bottom: 32px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #C8873A;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
          flex-shrink: 0;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .back-btn {
          width: 100%;
          padding: 13px;
          background: #C8873A;
          color: #ffffff;
          border: none;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 4px 14px rgba(200,135,58,0.25);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .back-btn:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .secondary-btn {
          width: 100%;
          padding: 13px;
          background: transparent;
          color: rgba(26,15,0,0.45);
          border: 1px solid rgba(26,15,0,0.1);
          border-radius: 100px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.04em;
        }

        .secondary-btn:hover {
          background: rgba(26,15,0,0.04);
          color: #1A0F00;
        }
      `}</style>

      <div className="confirm-root">
        {/* Logo */}
        <div className="confirm-logo">
          <span className="logo-dot" />
          CafeBoost
        </div>

        <div className="confirm-card">
          {/* Success icon */}
          <div className="confirm-icon">✓</div>

          <h1 className="confirm-title">Order Placed!</h1>
          <p className="confirm-sub">
            Your order has been received. Please wait.
          </p>

          <div className="divider" />

          {/* Live status indicator */}
          <div className="status-row">
            <span className="status-dot" />
            Your order is being prepared
          </div>

          {/* Back to menu */}
          <button
            onClick={() => router.push(`/qr/cafes/${cafeId}/menu`)}
            className="back-btn"
          >
            Order More
          </button>

          <button
            onClick={() => router.push("/")}
            className="secondary-btn"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </>
  );
}