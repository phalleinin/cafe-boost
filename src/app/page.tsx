import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .root {
          min-height: 100vh;
          background: #F7F3EE;
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        /* ── NAV ── */
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
          flex-shrink: 0;
        }

        .nav-links {
          display: flex;
          gap: 8px;
          align-items: center;
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
          white-space: nowrap;
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
        }

        .nav-link.primary:hover {
          background: rgba(200,135,58,0.18);
          border-color: rgba(200,135,58,0.5);
        }

        /* ── HERO ── */
        .hero {
          padding: 64px 24px 48px;
          text-align: center;
          max-width: 860px;
          margin: 0 auto;
          width: 100%;
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
          flex-shrink: 0;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(44px, 8vw, 96px);
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
          font-size: clamp(14px, 2vw, 16px);
          color: rgba(26,15,0,0.45);
          font-weight: 300;
          line-height: 1.7;
          max-width: 520px;
          margin: 16px auto 32px;
        }

        /* ── FEATURE STRIP ── */
        .strip {
          border-top: 1px solid rgba(200,135,58,0.15);
          border-bottom: 1px solid rgba(200,135,58,0.15);
          background: #ffffff;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 32px;
          flex-wrap: wrap;
        }

        .strip-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: rgba(26,15,0,0.4);
          letter-spacing: 0.06em;
          white-space: nowrap;
        }

        .strip-icon {
          color: #C8873A;
          font-size: 14px;
          flex-shrink: 0;
        }

        /* ── ROLE CARDS ── */
        .cards-section {
          padding: 48px 24px 80px;
          max-width: 900px;
          margin: 0 auto;
          width: 100%;
        }

        .cards-label {
          text-align: center;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(26,15,0,0.25);
          margin-bottom: 28px;
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
          padding: 36px 32px;
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

        .role-card:hover::before { opacity: 1; }

        .role-card-inner {
          position: relative;
          z-index: 1;
        }

        .role-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 20px;
          flex-shrink: 0;
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
          font-size: clamp(22px, 3vw, 28px);
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
          margin-bottom: 24px;
        }

        .role-features {
          list-style: none;
          margin-bottom: 28px;
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

        .owner .feature-dot  { background: #C8873A; }
        .barista .feature-dot { background: #B4641E; }

        .role-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 11px 22px;
          border-radius: 100px;
          border: 1px solid;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .role-btn-arrow { transition: transform 0.2s ease; }
        .role-card:hover .role-btn-arrow { transform: translateX(5px); }

        .owner .role-btn {
          color: #C8873A;
          border-color: rgba(200,135,58,0.35);
          background: rgba(200,135,58,0.08);
        }
        .owner:hover .role-btn { background: rgba(200,135,58,0.16); }

        .barista .role-btn {
          color: #B4641E;
          border-color: rgba(180,100,30,0.35);
          background: rgba(180,100,30,0.08);
        }
        .barista:hover .role-btn { background: rgba(180,100,30,0.16); }

        /* ── FOOTER ── */
        footer {
          padding: 20px 24px;
          border-top: 1px solid rgba(200,135,58,0.12);
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
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

        /* ── RESPONSIVE ── */

        /* tablet */
        @media (max-width: 768px) {
          nav { padding: 16px 24px; }

          .hero { padding: 48px 24px 40px; }

          .cards-section { padding: 36px 24px 60px; }

          .cards-grid {
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }

          .role-card { padding: 28px 22px; }
        }

        /* large mobile */
        @media (max-width: 600px) {
          nav { padding: 14px 16px; }
          .nav-links { gap: 4px; }
          .nav-link { padding: 7px 12px; font-size: 11px; }

          .hero { padding: 40px 16px 32px; }

          .strip { gap: 16px; padding: 14px 16px; }
          .strip-item { font-size: 11px; }

          .cards-section { padding: 28px 16px 48px; }

          /* ✅ stack cards on small screens */
          .cards-grid { grid-template-columns: 1fr; }

          .role-card { padding: 28px 24px; border-radius: 18px; }
          .role-card:hover { transform: none; }

          footer { padding: 16px; }
          .footer-copy { display: none; }
        }

        /* very small screens */
        @media (max-width: 380px) {
          .nav-link:not(.primary) { display: none; }
          .hero-badge { font-size: 10px; letter-spacing: 0.12em; }
        }
      `}</style>

      <div className="root">

        {/* Nav */}
        <nav>
          <span className="nav-logo">
            <span className="nav-dot" />
            CafeBoost
          </span>
          <div className="nav-links">
            <Link href="/auth/signin" className="nav-link">Sign In</Link>
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
            CafeBoost brings your café into the digital age — QR menus, real-time orders,
            and powerful analytics, all in one place.
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

        {/* Role cards */}
        <section className="cards-section">
          <p className="cards-label">Choose your role</p>
          <div className="cards-grid">

            <Link href="/auth/signin?role=owner" className="role-card owner">
              <div className="role-card-inner">
                <div className="role-icon-wrap">☕</div>
                <h2 className="role-title">Café Owner</h2>
                <p className="role-desc">
                  Manage your menu, track orders in real-time, and view sales analytics all from one dashboard.
                </p>
                <ul className="role-features">
                  <li><span className="feature-dot" />Menu management</li>
                  <li><span className="feature-dot" />Live order dashboard</li>
                  <li><span className="feature-dot" />Sales analytics</li>
                  <li><span className="feature-dot" />QR code generation</li>
                </ul>
                <span className="role-btn">
                  Owner Portal
                  <span className="role-btn-arrow">→</span>
                </span>
              </div>
            </Link>

            <Link href="/auth/signin?role=barista" className="role-card barista">
              <div className="role-card-inner">
                <div className="role-icon-wrap">🫖</div>
                <h2 className="role-title">Barista</h2>
                <p className="role-desc">
                  View and manage your queue, update order statuses, and keep service running smoothly.
                </p>
                <ul className="role-features">
                  <li><span className="feature-dot" />Live order queue</li>
                  <li><span className="feature-dot" />Status updates</li>
                  <li><span className="feature-dot" />Order history</li>
                  <li><span className="feature-dot" />Instant notifications</li>
                </ul>
                <span className="role-btn">
                  Staff Portal
                  <span className="role-btn-arrow">→</span>
                </span>
              </div>
            </Link>

          </div>
        </section>

        {/* Footer */}
        <footer>
          <span className="footer-logo">CafeBoost</span>
          <span className="footer-copy">© {new Date().getFullYear()} · Built for modern cafés</span>
        </footer>

      </div>
    </>
  );
}