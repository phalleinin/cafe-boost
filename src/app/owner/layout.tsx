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
  const [cafeId, setCafeId] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Profile sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCafeName, setEditCafeName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = "/owner/login"; return; }

        const { data: profile } = await supabase
          .from("profiles")
          .select("cafe_id, name, language")
          .eq("id", user.id)
          .single<ProfileRow>();

        if (!profile) { setMounted(true); return; }

        setOwnerName(profile.name || "");
        setEditName(profile.name || "");

        if (profile.cafe_id) {
          setCafeId(profile.cafe_id);
          const { data: cafe } = await supabase
            .from("cafes")
            .select("name")
            .eq("id", profile.cafe_id)
            .single();

          setCafeName(cafe?.name || "");
          setEditCafeName(cafe?.name || "");
        }

        setMounted(true);
      } catch (error) {
        console.error("Failed to initialize owner layout:", error);
        setMounted(true);
      }
    };
    void init();
  }, []);

  const openSheet = () => {
    setEditName(ownerName);
    setEditCafeName(cafeName);
    setEditPassword("");
    setSaveMsg(null);
    setSheetOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update profile name
      if (editName.trim() && editName.trim() !== ownerName) {
        const { error } = await supabase
          .from("profiles")
          .update({ name: editName.trim() })
          .eq("id", user.id);
        if (error) throw error;
        setOwnerName(editName.trim());
      }

      // Update cafe name
      if (cafeId && editCafeName.trim() && editCafeName.trim() !== cafeName) {
        const { error } = await supabase
          .from("cafes")
          .update({ name: editCafeName.trim() })
          .eq("id", cafeId);
        if (error) throw error;
        setCafeName(editCafeName.trim());
      }

      // Update password
      if (editPassword.trim()) {
        if (editPassword.length < 6) throw new Error("Password must be at least 6 characters");
        const { error } = await supabase.auth.updateUser({ password: editPassword });
        if (error) throw error;
        setEditPassword("");
      }

      setSaveMsg({ type: "ok", text: "Changes saved!" });
    } catch (err) {
      setSaveMsg({ type: "err", text: err instanceof Error ? err.message : "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

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
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#F7F3EE",
        color: "#1A0F00", fontFamily: "DM Sans, sans-serif",
      }}>
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

        .khmer-text { font-family: 'Noto Sans Khmer', 'DM Sans', sans-serif; }

        /* ── Sidebar ── */
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
        .nav-item:hover { background: rgba(200,135,58,0.08); color: #1A0F00; }
        .nav-item.active {
          background: rgba(200,135,58,0.12);
          color: #C8873A;
          border: 1px solid rgba(200,135,58,0.25);
        }

        .nav-icon { font-size: 16px; flex-shrink: 0; width: 20px; text-align: center; }
        .nav-label { opacity: ${collapsed ? 0 : 1}; transition: opacity 0.2s; }

        .sidebar-bottom {
          padding: 16px 8px;
          border-top: 1px solid rgba(200,135,58,0.15);
        }

        .language-wrap { padding: 0 4px 12px; }

        /* Owner chip — now a button */
        .owner-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 4px;
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s;
          font-family: 'DM Sans', 'Noto Sans Khmer', sans-serif;
        }
        .owner-chip:hover { background: rgba(200,135,58,0.08); }

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

        .owner-name-wrap {
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.2s;
          overflow: hidden;
          flex: 1;
        }

        .owner-name {
          font-size: 12px;
          color: rgba(26,15,0,0.6);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }

        .owner-edit-hint {
          font-size: 10px;
          color: #C8873A;
          letter-spacing: 0.04em;
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
        .signout-btn:hover { background: rgba(220,50,50,0.06); color: rgba(200,50,50,0.8); }
        .signout-label { opacity: ${collapsed ? 0 : 1}; transition: opacity 0.2s; }

        /* ── Main area ── */
        .main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

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

        .top-bar-right { display: flex; align-items: center; gap: 12px; }

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

        /* ── Profile Bottom Sheet ── */
        .sheet-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26,15,0,0.45);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .sheet {
          background: #ffffff;
          border-radius: 24px 24px 0 0;
          padding: 0 0 40px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 -8px 40px rgba(0,0,0,0.12);
          border-top: 1px solid rgba(200,135,58,0.15);
          animation: slideUp 0.28s cubic-bezier(0.4,0,0.2,1);
        }

        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        .sheet-handle {
          width: 36px;
          height: 4px;
          background: rgba(26,15,0,0.1);
          border-radius: 2px;
          margin: 16px auto 0;
        }

        .sheet-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px 24px 16px;
          border-bottom: 1px solid rgba(200,135,58,0.1);
        }

        .sheet-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(200,135,58,0.12);
          border: 1px solid rgba(200,135,58,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #C8873A;
          font-weight: 600;
          flex-shrink: 0;
          font-family: 'Cormorant Garamond', serif;
        }

        .sheet-header-info {}
        .sheet-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 600;
          color: #1A0F00;
          line-height: 1.2;
        }
        .sheet-subtitle {
          font-size: 11px;
          color: rgba(26,15,0,0.35);
          margin-top: 2px;
          letter-spacing: 0.04em;
        }

        .sheet-body { padding: 20px 24px 0; display: flex; flex-direction: column; gap: 16px; }

        .field-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(26,15,0,0.38);
          margin-bottom: 6px;
          display: block;
        }

        .field-input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid rgba(200,135,58,0.2);
          border-radius: 10px;
          background: #F7F3EE;
          color: #1A0F00;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s;
        }
        .field-input:focus { border-color: rgba(200,135,58,0.5); background: #fff; }
        .field-input::placeholder { color: rgba(26,15,0,0.25); }

        .save-msg {
          font-size: 12px;
          padding: 8px 12px;
          border-radius: 8px;
          text-align: center;
        }
        .save-msg.ok { background: rgba(40,160,90,0.08); color: #1A8A50; border: 1px solid rgba(40,160,90,0.2); }
        .save-msg.err { background: rgba(200,50,50,0.07); color: #c03030; border: 1px solid rgba(200,50,50,0.2); }

        .sheet-actions { padding: 20px 24px 0; display: flex; flex-direction: column; gap: 8px; }

        .btn-save {
          width: 100%;
          padding: 14px;
          background: #C8873A;
          color: #fff;
          border: none;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s;
          box-shadow: 0 4px 14px rgba(200,135,58,0.25);
          letter-spacing: 0.06em;
        }
        .btn-save:hover { opacity: 0.88; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-signout {
          width: 100%;
          padding: 13px;
          background: transparent;
          color: rgba(200,50,50,0.7);
          border: 1px solid rgba(200,50,50,0.2);
          border-radius: 100px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.04em;
        }
        .btn-signout:hover { background: rgba(200,50,50,0.06); color: #c03030; }

        .btn-cancel {
          width: 100%;
          padding: 13px;
          background: transparent;
          color: rgba(26,15,0,0.35);
          border: 1px solid rgba(26,15,0,0.1);
          border-radius: 100px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-cancel:hover { background: rgba(26,15,0,0.04); }

        @media (max-width: 768px) {
          .sidebar { display: none; }
          .page-content { padding: 20px; }
          .top-bar { padding: 14px 20px; }
          .sheet { max-width: 100%; }
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

            {/* Owner chip — tap to open profile sheet */}
            <button className="owner-chip" onClick={openSheet}>
              <div className="owner-avatar">
                {ownerName?.charAt(0)?.toUpperCase() || "O"}
              </div>
              <div className="owner-name-wrap">
                <span className={`owner-name ${t.meta.isKhmer ? "khmer-text" : ""}`}>
                  {ownerName || t.common.owner}
                </span>
                <span className="owner-edit-hint">Edit profile</span>
              </div>
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
              {/* Tap cafe badge on mobile to open profile sheet */}
              <button
                className="cafe-badge"
                style={{ cursor: "pointer", border: "1px solid rgba(200,135,58,0.2)", background: "rgba(200,135,58,0.08)", fontFamily: "inherit" }}
                onClick={openSheet}
              >
                {cafeName}
              </button>
            </div>
          </header>

          <main className="page-content">{children}</main>
        </div>
      </div>

      {/* ── Profile Bottom Sheet ── */}
      {sheetOpen && (
        <div className="sheet-overlay" onClick={() => setSheetOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />

            <div className="sheet-header">
              <div className="sheet-avatar">
                {ownerName?.charAt(0)?.toUpperCase() || "O"}
              </div>
              <div className="sheet-header-info">
                <p className="sheet-title">{ownerName || "Owner"}</p>
                <p className="sheet-subtitle">{cafeName}</p>
              </div>
            </div>

            <div className="sheet-body">
              <div>
                <label className="field-label">Your Name</label>
                <input
                  className="field-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>

              <div>
                <label className="field-label">Café Name</label>
                <input
                  className="field-input"
                  value={editCafeName}
                  onChange={(e) => setEditCafeName(e.target.value)}
                  placeholder="Your café name"
                />
              </div>

              <div>
                <label className="field-label">New Password</label>
                <input
                  className="field-input"
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                />
              </div>

              {saveMsg && (
                <p className={`save-msg ${saveMsg.type}`}>{saveMsg.text}</p>
              )}
            </div>

            <div className="sheet-actions">
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button className="btn-signout" onClick={handleSignOut}>
                Sign Out
              </button>
              <button className="btn-cancel" onClick={() => setSheetOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <OwnerLayoutInner>{children}</OwnerLayoutInner>
    </LocaleProvider>
  );
}