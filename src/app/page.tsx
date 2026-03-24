import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .root {
          min-height: 100vh;
          background: #F7F3EE;
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
          position: relative;
        }

        .content {
          position: relative;
          z-index: 1;
        }

        /* NAV */
        nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 48px;
          border-bottom: 1px solid rgba(200,135,58,0.15);
          background: #ffffff;
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .nav-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          color: #1A0F00;
          letter-spacing: 0.06em;
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .nav-dot {
          width: 7px;
          height: 7px;
          background: #C8873A;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(200,135,58,0.4);
        }

        .nav-links {
          display: flex;
          gap: 8px;
        }

        .nav-link {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(26,15,0,0.55);
          text-decoration: none;
          padding: 8px 18px;
          border-radius: 100px;
          border: 1px solid transparent;
          transition: all 0.2s;
        }

        .nav-link:hover {
          color: #C8873A;
          border-color: rgba(200,135,58,0.3);
          background: rgba(200,135,58,0.06);
        }

        .nav-link.primary {
          color: #C8873A;
          border-color: rgba(200,135,58,0.35);
          background: rgba(200,135,58,0.08);
          font-weight: 500;
        }

        .nav-link.primary:hover {
          background: rgba(200,135,58,0.18);
          border-color: rgba(200,135,58,0.5);
        }

        /* HERO */
        .hero {
          padding: 32px 80px;
          text-align: center;
          max-width: 900px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(200,135,58,0.08);
          border: 1px solid rgba(200,135,58,0.25);
          color: #C8873A;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 7px 18px;
          border-radius: 100px;
          margin-bottom: 24px;
        }

        .hero-badge-dot {
          width: 5px;
          height: 5px;
          background: #C8873A;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(52px, 9vw, 96px);
          font-weight: 300;
          color: #1A0F00;
          line-height: 1.0;
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }

        .hero-title-accent {
          font-style: italic;
          font-weight: 700;
          color: #C8873A;
          display: block;
        }

        .hero-sub {
          font-size: 16px;
          color: rgba(26,15,0,0.45);
          font-weight: 300;
          line-height: 1.7;
          max-width: 520px;
          margin: 16px auto 32px;
        }

        /* FEATURES STRIP */
        .strip {
          border-top: 1px solid rgba(200,135,58,0.15);
          border-bottom: 1px solid rgba(200,135,58,0.15);
          background: #ffffff;
          padding: 16px 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 48px;
          flex-wrap: wrap;
        }

        .strip-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: rgba(26,15,0,0.4);
          letter-spacing: 0.06em;
        }

        .strip-icon {
          color: #C8873A;
          font-size: 14px;
        }

        /* ROLE CARDS */
        .cards-section {
          padding: 0 48px 100px;
          max-width: 900px;
          margin: 0 auto;
        }

        .cards-label {
          text-align: center;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(26,15,0,0.25);
          margin-bottom: 32px;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .role-card {
          position: relative;
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.15);
          border-radius: 24px;
          padding: 40px 36px;
          text-decoration: none;
          display: block;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .role-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          opacity: 0;
          transition: opacity 0.35s ease;
        }

        .role-card.owner::before {
          background: radial-gradient(ellipse at top left, rgba(200,135,58,0.07) 0%, transparent 65%);
        }

        .role-card.barista::before {
          background: radial-gradient(ellipse at top left, rgba(180,100,30,0.07) 0%, transparent 65%);
        }

        .role-card:hover {
          transform: translateY(-6px);
          border-color: rgba(200,135,58,0.3);
          box-shadow: 0 20px 48px rgba(200,135,58,0.1);
        }

        .role-card:hover::before {
          opacity: 1;
        }

        .role-card-inner {
          position: relative;
          z-index: 1;
        }

        .role-icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          margin-bottom: 24px;
        }

        .owner .role-icon-wrap {
          background: rgba(200,135,58,0.1);
          border: 1px solid rgba(200,135,58,0.2);
        }

        .barista .role-icon-wrap {
          background: rgba(180,100,30,0.1);
          border: 1px solid rgba(180,100,30,0.2);
        }

        .role-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 10px;
          letter-spacing: 0.02em;
        }

        .role-desc {
          font-size: 13px;
          color: rgba(26,15,0,0.45);
          line-height: 1.65;
          font-weight: 300;
          margin-bottom: 32px;
        }

        .role-features {
          list-style: none;
          margin-bottom: 32px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .role-features li {
          font-size: 12px;
          color: rgba(26,15,0,0.4);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .feature-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .owner .feature-dot { background: #C8873A; }
        .barista .feature-dot { background: #B4641E; }

        .role-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 12px 24px;
          border-radius: 100px;
          border: 1px solid;
          transition: all 0.2s ease;
        }

        .role-btn-arrow {
          transition: transform 0.2s ease;
        }

        .role-card:hover .role-btn-arrow {
          transform: translateX(5px);
        }

        .owner .role-btn {
          color: #C8873A;
          border-color: rgba(200,135,58,0.35);
          background: rgba(200,135,58,0.08);
        }

        .owner:hover .role-btn {
          background: rgba(200,135,58,0.16);
        }

        .barista .role-btn {
          color: #B4641E;
          border-color: rgba(180,100,30,0.35);
          background: rgba(180,100,30,0.08);
        }

        .barista:hover .role-btn {
          background: rgba(180,100,30,0.16);
        }

        /* FOOTER */
        footer {
          padding: 24px 48px;
          border-top: 1px solid rgba(200,135,58,0.12);
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .footer-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          color: rgba(26,15,0,0.25);
          letter-spacing: 0.08em;
        }

        .footer-copy {
          font-size: 11px;
          color: rgba(26,15,0,0.2);
          letter-spacing: 0.05em;
        }

        @media (max-width: 680px) {
          nav { padding: 16px 20px; }
          .nav-links { display: none; }
          .hero { padding: 60px 24px 60px; }
          .cards-section { padding: 0 24px 60px; }
          .cards-grid { grid-template-columns: 1fr; }
          .strip { padding: 20px 24px; gap: 24px; }
          footer { padding: 20px 24px; }
        }
      `}</style>

      <div className="root">
        <div className="content">
          {/* Nav */}
          <nav>
            <span className="nav-logo">
              <span className="nav-dot" />
              CafeBoost
            </span>
            <div className="nav-links">
              {/* ✅ Added className to fix hover and color */}
              <Link href="/auth/signin" className="nav-link">Owner Sign In</Link>
              <Link href="/auth/signup" className="nav-link primary">Get Started</Link>
            </div>
          </nav>

          {/* Hero */}
          <section className="hero">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Smart QR Ordering System
            </div>
            <h1 className="hero-title">
              Your Café,
              <span className="hero-title-accent">Reimagined.</span>
            </h1>
            <p className="hero-sub">
              CafeBoost brings your café into the digital age — QR menus, real-time orders, and powerful analytics, all in one place.
            </p>
          </section>

          {/* Feature strip */}
          <div className="strip">
            {[
              { icon: "◈", label: "QR Menu Ordering" },
              { icon: "◎", label: "Real-time Order Queue" },
              { icon: "◉", label: "Sales Analytics" },
            ].map((f) => (
              <div key={f.label} className="strip-item">
                <span className="strip-icon">{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

          {/* Footer */}
          <footer>
            <span className="footer-logo">CafeBoost</span>
            <span className="footer-copy">© {new Date().getFullYear()} · Built for modern cafés</span>
          </footer>
        </div>
      </div>
    </>
  );
}