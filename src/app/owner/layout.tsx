"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { LocaleProvider, useLocale } from "@/i18n/locale-context";
import LanguageSwitcher from "@/app/components/owner/LanguageSwitcher";

type ProfileRow = {
  cafe_id: string | null;
  name: string | null;
  language?: "en" | "km" | null;
};

function OwnerLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t, ready } = useLocale();

  const [cafeName, setCafeName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = "/owner/login";
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("cafe_id, name, language")
          .eq("id", user.id)
          .single<ProfileRow>();

        if (!profile) {
          setMounted(true);
          return;
        }

        setOwnerName(profile.name || "");

        if (profile.cafe_id) {
          const { data: cafe } = await supabase
            .from("cafes")
            .select("name")
            .eq("id", profile.cafe_id)
            .single();

          setCafeName(cafe?.name || "");
        }

        setMounted(true);
      } catch (error) {
        console.error("Failed to initialize owner layout:", error);
        setMounted(true);
      }
    };

    void init();
  }, []);

  const navItems = useMemo(
    () => [
      { href: "/owner/dashboard", icon: "◎", label: t.nav.orders },
      { href: "/owner/analytics", icon: "◉", label: t.nav.analytics },
      { href: "/owner/menu", icon: "◈", label: t.nav.menu },
      { href: "/owner/menuQR", icon: "▣", label: t.nav.qrCode },
    ],
    [t]
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const currentPageTitle = mounted
    ? navItems.find((n) => n.href === pathname)?.label || t.common.dashboard
    : "";

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F7F3EE",
          color: "#1A0F00",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        {t.common.loading}
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,600&family=DM+Sans:wght@300;400;500&family=Noto+Sans+Khmer:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .owner-shell {
          display: flex;
          min-height: 100vh;
          background: #F7F3EE;
          font-family: 'DM Sans', 'Noto Sans Khmer', sans-serif;
          color: #1A0F00;
        }

        .khmer-text {
          font-family: 'Noto Sans Khmer', 'DM Sans', sans-serif;
        }

        .sidebar {
          width: ${collapsed ? "72px" : "260px"};
          min-height: 100vh;
          background: #ffffff;
          border-right: 1px solid rgba(200,135,58,0.2);
          display: flex;
          flex-direction: column;
          transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
          flex-shrink: 0;
          z-index: 20;
          box-shadow: 2px 0 12px rgba(0,0,0,0.04);
        }

        .sidebar-top {
          padding: 24px 16px 20px;
          border-bottom: 1px solid rgba(200,135,58,0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .sidebar-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 600;
          color: #1A0F00;
          letter-spacing: 0.06em;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.2s;
          overflow: hidden;
        }

        .logo-dot {
          width: 6px;
          height: 6px;
          background: #C8873A;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(200,135,58,0.5);
          flex-shrink: 0;
        }

        .collapse-btn {
          background: none;
          border: none;
          color: rgba(26,15,0,0.3);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          font-size: 14px;
          transition: color 0.2s;
          flex-shrink: 0;
          font-family: 'DM Sans', sans-serif;
        }

        .collapse-btn:hover { color: #C8873A; }

        .sidebar-nav {
          flex: 1;
          padding: 16px 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          text-decoration: none;
          color: rgba(26,15,0,0.45);
          font-size: 13px;
          font-weight: 400;
          transition: all 0.2s;
          white-space: nowrap;
          overflow: hidden;
        }

        .nav-item:hover {
          background: rgba(200,135,58,0.08);
          color: #1A0F00;
        }

        .nav-item.active {
          background: rgba(200,135,58,0.12);
          color: #C8873A;
          border: 1px solid rgba(200,135,58,0.25);
        }

        .nav-icon {
          font-size: 16px;
          flex-shrink: 0;
          width: 20px;
          text-align: center;
        }

        .nav-label {
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.2s;
        }

        .sidebar-bottom {
          padding: 16px 8px;
          border-top: 1px solid rgba(200,135,58,0.15);
        }

        .language-wrap {
          padding: 0 4px 12px;
        }

        .owner-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 4px;
        }

        .owner-avatar {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(200,135,58,0.12);
          border: 1px solid rgba(200,135,58,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          flex-shrink: 0;
          color: #C8873A;
          font-weight: 600;
        }

        .owner-name {
          font-size: 12px;
          color: rgba(26,15,0,0.45);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.2s;
        }

        .signout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(26,15,0,0.3);
          font-size: 13px;
          font-family: 'DM Sans', 'Noto Sans Khmer', sans-serif;
          transition: all 0.2s;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
        }

        .signout-btn:hover {
          background: rgba(220,50,50,0.06);
          color: rgba(200,50,50,0.8);
        }

        .signout-label {
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.2s;
        }

        .main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .top-bar {
          padding: 16px 32px;
          border-bottom: 1px solid rgba(200,135,58,0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .page-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 600;
          color: #1A0F00;
          letter-spacing: 0.02em;
        }

        .top-bar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cafe-badge {
          font-size: 12px;
          color: #C8873A;
          background: rgba(200,135,58,0.08);
          border: 1px solid rgba(200,135,58,0.2);
          padding: 5px 14px;
          border-radius: 100px;
        }

        .page-content {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
          background: #F7F3EE;
        }

        @media (max-width: 768px) {
          .sidebar { display: none; }
          .page-content { padding: 20px; }
          .top-bar { padding: 14px 20px; }
        }
      `}</style>

      <div className="owner-shell">
        <aside className="sidebar">
          <div className="sidebar-top">
            <span className="sidebar-logo">
              <span className="logo-dot" />
              CafeBoost
            </span>

            <button
              className="collapse-btn"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={t.ownerLayout.toggleSidebar}
            >
              {collapsed ? "→" : "←"}
            </button>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${mounted && pathname === item.href ? "active" : ""} ${
                  t.meta.isKhmer ? "khmer-text" : ""
                }`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="sidebar-bottom">
            {!collapsed && (
              <div className="language-wrap">
                <LanguageSwitcher />
              </div>
            )}

            <div className="owner-chip">
              <div className="owner-avatar">
                {ownerName?.charAt(0)?.toUpperCase() || "O"}
              </div>
              <span className={`owner-name ${t.meta.isKhmer ? "khmer-text" : ""}`}>
                {ownerName || t.common.owner}
              </span>
            </div>

            <button className="signout-btn" onClick={handleSignOut}>
              <span className="nav-icon">⊗</span>
              <span className={`signout-label ${t.meta.isKhmer ? "khmer-text" : ""}`}>
                {t.common.signOut}
              </span>
            </button>
          </div>
        </aside>

        <div className="main-area">
          <header className="top-bar">
            <span className={`page-title ${t.meta.isKhmer ? "khmer-text" : ""}`}>
              {currentPageTitle}
            </span>

            <div className="top-bar-right">
              {collapsed && <LanguageSwitcher />}
              <span className="cafe-badge">{cafeName}</span>
            </div>
          </header>

          <main className="page-content">{children}</main>
        </div>
      </div>
    </>
  );
}

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider>
      <OwnerLayoutInner>{children}</OwnerLayoutInner>
    </LocaleProvider>
  );
}