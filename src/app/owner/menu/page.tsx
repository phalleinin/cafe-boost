"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { uploadMenuImage } from "@/lib/uploadImage";
import type { MenuItem } from "@/types/menu";
import Link from "next/link";
import { useLocale } from "@/i18n/locale-context";

type MenuCategory = "hot" | "cold" | "frappe";

export default function OwnerMenuPage() {
  const { t } = useLocale();

  const [cafeId, setCafeId] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [filteredMenu, setFilteredMenu] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [editImage, setEditImage] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = "/auth/signin";
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("cafe_id")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (!profile?.cafe_id) {
          window.location.href = "/auth/setup-cafe";
          return;
        }

        setCafeId(profile.cafe_id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t.menu.failedToLoadProfile
        );
        setLoading(false);
      }
    };

    void init();
  }, [t.menu.failedToLoadProfile]);

  useEffect(() => {
    if (!cafeId) return;

    let cancelled = false;

    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("menus")
          .select("*")
          .eq("cafe_id", cafeId)
          .order("is_available", { ascending: false })
          .order("price", { ascending: true });

        if (error) throw error;

        if (!cancelled) {
          const menuData = data || [];
          setMenu(menuData);
          setFilteredMenu(menuData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t.menu.errorLoadingMenu);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchMenu();

    return () => {
      cancelled = true;
    };
  }, [cafeId, t.menu.errorLoadingMenu]);

  useEffect(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      setFilteredMenu(menu);
      return;
    }

    const filtered = menu.filter((item) =>
      item.name.toLowerCase().includes(normalizedSearch)
    );

    setFilteredMenu(filtered);
  }, [search, menu]);

  useEffect(() => {
    return () => {
      if (editPreview && editPreview.startsWith("blob:")) {
        URL.revokeObjectURL(editPreview);
      }
    };
  }, [editPreview]);

  const getItemCategory = (item: MenuItem): MenuCategory | "" => {
    const rawCategory = (
      item as MenuItem & { category?: string | null }
    ).category;

    if (!rawCategory) return "";

    const normalized = rawCategory.toLowerCase();

    if (
      normalized === "hot" ||
      normalized === "cold" ||
      normalized === "frappe"
    ) {
      return normalized;
    }

    return "";
  };

  const hotItems = useMemo(
    () => filteredMenu.filter((item) => getItemCategory(item) === "hot"),
    [filteredMenu]
  );

  const coldItems = useMemo(
    () => filteredMenu.filter((item) => getItemCategory(item) === "cold"),
    [filteredMenu]
  );

  const frappeItems = useMemo(
    () => filteredMenu.filter((item) => getItemCategory(item) === "frappe"),
    [filteredMenu]
  );

  const uncategorizedItems = useMemo(
    () => filteredMenu.filter((item) => getItemCategory(item) === ""),
    [filteredMenu]
  );

  const handleToggleAvailability = async (item: MenuItem) => {
    setTogglingId(item.id);

    const { error } = await supabase
      .from("menus")
      .update({ is_available: !item.is_available })
      .eq("id", item.id);

    if (error) {
      alert(t.menu.failedToUpdateAvailability);
      setTogglingId(null);
      return;
    }

    setMenu((prev) =>
      prev.map((m) =>
        m.id === item.id ? { ...m, is_available: !m.is_available } : m
      )
    );

    setTogglingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.menu.confirmDelete)) return;

    setDeletingId(id);

    const { error } = await supabase.from("menus").delete().eq("id", id);

    if (error) {
      alert(t.menu.failedToDeleteItem);
      setDeletingId(null);
      return;
    }

    setMenu((prev) => prev.filter((m) => m.id !== id));
    setDeletingId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    setSavingEdit(true);

    try {
      let imageUrl = editingItem.image_url;

      if (editImage) {
        imageUrl = await uploadMenuImage(editImage);
      }

      const updatedItem: MenuItem = {
        ...editingItem,
        image_url: imageUrl,
      };

      const updatedCategory =
        ((updatedItem as MenuItem & { category?: MenuCategory }).category ??
          "cold");

      const { error } = await supabase
        .from("menus")
        .update({
          name: updatedItem.name,
          description: updatedItem.description,
          price: updatedItem.price,
          category: updatedCategory,
          is_available: updatedItem.is_available,
          image_url: updatedItem.image_url,
        })
        .eq("id", updatedItem.id);

      if (error) {
        alert(t.menu.failedToUpdateItem);
        setSavingEdit(false);
        return;
      }

      setMenu((prev) =>
        prev.map((m) =>
          m.id === updatedItem.id
            ? ({ ...updatedItem, category: updatedCategory } as MenuItem)
            : m
        )
      );

      if (editPreview && editPreview.startsWith("blob:")) {
        URL.revokeObjectURL(editPreview);
      }

      setEditingItem(null);
      setEditImage(null);
      setEditPreview(null);
      setSavingEdit(false);
    } catch {
      alert(t.menu.failedToUpdateItem);
      setSavingEdit(false);
    }
  };

  const closeEditModal = () => {
    if (editPreview && editPreview.startsWith("blob:")) {
      URL.revokeObjectURL(editPreview);
    }

    setEditingItem(null);
    setEditImage(null);
    setEditPreview(null);
  };

  const renderMenuCards = (items: MenuItem[]) =>
    items.map((item) => (
      <div key={item.id} className="menu-card">
        {item.image_url ? (
          <div className="image-wrapper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt={item.name}
              className="item-image"
            />
            <div className="image-overlay" />
          </div>
        ) : (
          <div className={`item-image-fallback ${t.meta.isKhmer ? "khmer-text" : ""}`}>
            {t.menu.modal.itemImage}
          </div>
        )}

        {!item.is_available && (
          <span
            className={`unavailable-badge ${
              t.meta.isKhmer ? "khmer-text" : ""
            }`}
          >
            {t.menu.unavailable}
          </span>
        )}

        <h3 className="item-name">{item.name}</h3>
        <p className={`item-desc ${t.meta.isKhmer ? "khmer-text" : ""}`}>
          {item.description || t.menu.noDescription}
        </p>
        <p className="item-price">${item.price.toFixed(2)}</p>

        <div className="card-actions">
          <button
            onClick={() => {
              setEditingItem({
                ...item,
                category:
                  ((item as MenuItem & { category?: MenuCategory }).category ??
                    "cold"),
              } as MenuItem);
              setEditImage(null);
              setEditPreview(item.image_url || null);
            }}
            className="btn btn-edit"
          >
            {t.menu.actions.edit}
          </button>

          <button
            onClick={() => handleDelete(item.id)}
            disabled={deletingId === item.id}
            className="btn btn-delete"
          >
            {deletingId === item.id
              ? t.menu.actions.deleting
              : t.menu.actions.delete}
          </button>

          <button
            onClick={() => handleToggleAvailability(item)}
            disabled={togglingId === item.id}
            className="btn btn-toggle"
          >
            {togglingId === item.id
              ? t.menu.actions.updating
              : item.is_available
                ? t.menu.actions.markUnavailable
                : t.menu.actions.markAvailable}
          </button>
        </div>
      </div>
    ));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;600&family=DM+Sans:wght@300;400;500&family=Noto+Sans+Khmer:wght@300;400;500;600;700&display=swap');

        .menu-root {
          font-family: 'DM Sans', 'Noto Sans Khmer', sans-serif;
          color: #1A0F00;
        }

        .khmer-text {
          font-family: 'Noto Sans Khmer', 'DM Sans', sans-serif;
        }

        .menu-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 36px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .menu-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 52px;
          line-height: 0.95;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 8px;
        }

        .menu-sub {
          font-size: 18px;
          color: rgba(26,15,0,0.42);
          font-weight: 300;
        }

        .search-input {
          width: 100%;
          max-width: 520px;
          padding: 14px 20px;
          border-radius: 999px;
          border: 1px solid rgba(200,135,58,0.2);
          font-size: 15px;
          font-family: 'DM Sans', 'Noto Sans Khmer', sans-serif;
          background: #ffffff;
          color: #1A0F00;
          outline: none;
          margin-bottom: 12px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-input:focus {
          border-color: rgba(200,135,58,0.45);
          box-shadow: 0 0 0 3px rgba(200,135,58,0.08);
        }

        .search-input::placeholder {
          color: rgba(26,15,0,0.30);
        }

        .add-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #C8873A;
          color: #ffffff;
          padding: 14px 28px;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 10px 24px rgba(200,135,58,0.24);
        }

        .add-btn:hover {
          opacity: 0.92;
          transform: translateY(-2px);
        }

        .status-msg {
          font-size: 14px;
          color: rgba(26,15,0,0.38);
          padding: 36px 0;
          text-align: center;
        }

        .error-msg {
          font-size: 13px;
          color: #C03030;
          background: rgba(220,50,50,0.06);
          border: 1px solid rgba(220,50,50,0.15);
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 18px;
        }

        .category-section {
          margin-bottom: 40px;
        }

        .category-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 40px;
          line-height: 1;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 18px;
        }

        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .menu-card {
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(200,135,58,0.12);
          border-radius: 28px;
          padding: 20px;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          box-shadow: 0 10px 30px rgba(26,15,0,0.05);
          overflow: hidden;
        }

        .menu-card:hover {
          transform: translateY(-6px);
          border-color: rgba(200,135,58,0.22);
          box-shadow: 0 18px 44px rgba(26,15,0,0.09);
        }

        .image-wrapper {
          position: relative;
          width: 100%;
          height: 260px;
          overflow: hidden;
          border-radius: 20px;
          margin-bottom: 18px;
          background: #f8f6f2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .item-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
          transition: transform 0.35s ease;
        }

        .menu-card:hover .item-image {
          transform: scale(1.03);
        }

        .image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(26,15,0,0.04) 0%,
            rgba(26,15,0,0.00) 45%
          );
          pointer-events: none;
        }

        .item-image-fallback {
          width: 100%;
          height: 260px;
          border-radius: 20px;
          margin-bottom: 18px;
          background: linear-gradient(135deg, #f6f0e8, #efe4d4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(26,15,0,0.35);
          font-size: 13px;
          border: 1px solid rgba(200,135,58,0.08);
        }

        .unavailable-badge {
          display: inline-flex;
          align-items: center;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #C03030;
          background: rgba(220,50,50,0.08);
          border: 1px solid rgba(220,50,50,0.15);
          padding: 5px 10px;
          border-radius: 999px;
          margin-bottom: 12px;
        }

        .item-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 34px;
          line-height: 1;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 8px;
        }

        .item-desc {
          font-size: 14px;
          color: rgba(26,15,0,0.50);
          font-weight: 400;
          line-height: 1.6;
          margin-bottom: 18px;
          min-height: 44px;
        }

        .item-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 38px;
          line-height: 1;
          font-weight: 600;
          color: #C8873A;
          margin-bottom: 20px;
        }

        .card-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          padding-top: 16px;
          border-top: 1px solid rgba(200,135,58,0.08);
        }

        .btn {
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'DM Sans', 'Noto Sans Khmer', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid;
          letter-spacing: 0.03em;
          background: white;
        }

        .btn-edit {
          background: rgba(200,135,58,0.08);
          color: #C8873A;
          border-color: rgba(200,135,58,0.25);
        }

        .btn-edit:hover {
          background: #C8873A;
          color: white;
          border-color: #C8873A;
        }

        .btn-delete {
          background: rgba(220,50,50,0.06);
          color: #C03030;
          border-color: rgba(220,50,50,0.20);
        }

        .btn-delete:hover {
          background: #C03030;
          color: white;
          border-color: #C03030;
        }

        .btn-delete:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .btn-toggle {
          background: rgba(26,15,0,0.04);
          color: rgba(26,15,0,0.58);
          border-color: rgba(26,15,0,0.10);
        }

        .btn-toggle:hover {
          background: rgba(26,15,0,0.10);
          color: #1A0F00;
        }

        .btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .qr-section {
          display: flex;
          justify-content: center;
          padding-top: 18px;
          border-top: 1px solid rgba(200,135,58,0.1);
        }

        .qr-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 30px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-decoration: none;
          transition: all 0.2s;
        }

        .qr-btn.active {
          background: #C8873A;
          color: #ffffff;
          box-shadow: 0 10px 24px rgba(200,135,58,0.24);
        }

        .qr-btn.active:hover {
          opacity: 0.92;
          transform: translateY(-2px);
        }

        .qr-btn.disabled {
          background: rgba(26,15,0,0.06);
          color: rgba(26,15,0,0.25);
          pointer-events: none;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26,15,0,0.4);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          z-index: 50;
          padding: 24px;
          backdrop-filter: blur(4px);
          overflow-y: auto;
        }

        .modal-card {
          background: #ffffff;
          border-radius: 28px;
          padding: 32px;
          width: 100%;
          max-width: 520px;
          max-height: calc(100vh - 48px);
          overflow-y: auto;
          box-shadow: 0 28px 80px rgba(0,0,0,0.14);
          border: 1px solid rgba(200,135,58,0.12);
          margin: 0 auto;
          scrollbar-width: thin;
          padding-right: 24px;
        }

        .modal-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 38px;
          line-height: 1;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 24px;
        }

        .modal-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(26,15,0,0.45);
          margin-bottom: 6px;
        }

        .modal-input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid rgba(200,135,58,0.20);
          border-radius: 16px;
          background: #F7F3EE;
          color: #1A0F00;
          font-size: 15px;
          font-family: 'DM Sans', 'Noto Sans Khmer', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          margin-bottom: 18px;
        }

        .modal-input:focus {
          border-color: rgba(200,135,58,0.45);
          box-shadow: 0 0 0 3px rgba(200,135,58,0.08);
          background: #ffffff;
        }

        .modal-input::placeholder {
          color: rgba(26,15,0,0.22);
        }

        .modal-image-preview {
          width: 100%;
          height: 220px;
          object-fit: contain;
          object-position: center;
          border-radius: 16px;
          margin-bottom: 18px;
          border: 1px solid rgba(200,135,58,0.12);
          display: block;
          background: #f8f6f2;
          padding: 12px;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 18px;
        }

        .category-option {
          border: 1px solid rgba(200,135,58,0.16);
          background: #fff;
          color: #1A0F00;
          border-radius: 16px;
          padding: 14px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', 'Noto Sans Khmer', sans-serif;
        }

        .category-option:hover {
          border-color: rgba(200,135,58,0.4);
          background: #fffaf4;
        }

        .category-option.active {
          background: rgba(200,135,58,0.10);
          border-color: #C8873A;
          color: #C8873A;
          box-shadow: 0 0 0 3px rgba(200,135,58,0.08);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 18px;
          padding-top: 8px;
          background: #ffffff;
        }

        .modal-cancel {
          padding: 12px 22px;
          border-radius: 999px;
          border: 1px solid rgba(26,15,0,0.12);
          background: transparent;
          color: rgba(26,15,0,0.5);
          font-size: 13px;
          font-family: 'DM Sans', 'Noto Sans Khmer', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-cancel:hover {
          background: rgba(26,15,0,0.04);
          color: #1A0F00;
        }

        .modal-save {
          padding: 12px 26px;
          border-radius: 999px;
          border: none;
          background: #C8873A;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', 'Noto Sans Khmer', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          letter-spacing: 0.03em;
        }

        .modal-save:hover {
          opacity: 0.92;
          transform: translateY(-1px);
        }

        .modal-save:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .menu-header {
            align-items: stretch;
          }

          .search-input {
            max-width: none;
          }

          .category-title {
            font-size: 34px;
          }

          .menu-grid {
            grid-template-columns: 1fr;
          }

          .modal-overlay {
            padding: 12px;
          }

          .modal-card {
            padding: 20px;
            padding-right: 16px;
            border-radius: 22px;
            max-height: calc(100vh - 24px);
          }

          .category-grid {
            grid-template-columns: 1fr;
          }

          .modal-actions {
            flex-direction: column-reverse;
          }

          .modal-cancel,
          .modal-save {
            width: 100%;
          }
        }
      `}</style>
      <div className="menu-root">
        <div className="menu-header">
          <div>
            <input
              type="text"
              placeholder={t.menu.searchPlaceholder}
              className={`search-input ${t.meta.isKhmer ? "khmer-text" : ""}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <p className={`menu-sub ${t.meta.isKhmer ? "khmer-text" : ""}`}>
              {t.menu.subtitle}
            </p>
          </div>

          <Link href="/owner/menu/add" className="add-btn">
            + {t.menu.addNewItem}
          </Link>
        </div>

        {loading && (
          <p className={`status-msg ${t.meta.isKhmer ? "khmer-text" : ""}`}>
            {t.menu.loadingMenu}
          </p>
        )}

        {error && (
          <div className={`error-msg ${t.meta.isKhmer ? "khmer-text" : ""}`}>
            {error}
          </div>
        )}

        {!loading && !error && menu.length === 0 && (
          <p className={`status-msg ${t.meta.isKhmer ? "khmer-text" : ""}`}>
            {t.menu.emptyState}
          </p>
        )}

        {!loading && !error && menu.length > 0 && filteredMenu.length === 0 && (
          <p className={`status-msg ${t.meta.isKhmer ? "khmer-text" : ""}`}>
            {t.menu.noSearchResults}
          </p>
        )}

        {!loading && !error && filteredMenu.length > 0 && (
          <>
            {hotItems.length > 0 && (
              <section className="category-section">
                <h2
                  className={`category-title ${
                    t.meta.isKhmer ? "khmer-text" : ""
                  }`}
                >
                  {t.menu.categories.hotDrinks}
                </h2>
                <div className="menu-grid">{renderMenuCards(hotItems)}</div>
              </section>
            )}

            {coldItems.length > 0 && (
              <section className="category-section">
                <h2
                  className={`category-title ${
                    t.meta.isKhmer ? "khmer-text" : ""
                  }`}
                >
                  {t.menu.categories.coldDrinks}
                </h2>
                <div className="menu-grid">{renderMenuCards(coldItems)}</div>
              </section>
            )}

            {frappeItems.length > 0 && (
              <section className="category-section">
                <h2
                  className={`category-title ${
                    t.meta.isKhmer ? "khmer-text" : ""
                  }`}
                >
                  {t.menu.categories.frappe}
                </h2>
                <div className="menu-grid">{renderMenuCards(frappeItems)}</div>
              </section>
            )}

            {uncategorizedItems.length > 0 && (
              <section className="category-section">
                <h2
                  className={`category-title ${
                    t.meta.isKhmer ? "khmer-text" : ""
                  }`}
                >
                  {t.menu.categories.otherDrinks}
                </h2>
                <div className="menu-grid">
                  {renderMenuCards(uncategorizedItems)}
                </div>
              </section>
            )}
          </>
        )}

        <div className="qr-section">
          <Link
            href="/owner/menuQR"
            className={`qr-btn ${menu.length > 0 ? "active" : "disabled"} ${
              t.meta.isKhmer ? "khmer-text" : ""
            }`}
          >
            ▣ {t.menu.generateQr}
          </Link>
        </div>
      </div>

      {editingItem && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 className={`modal-title ${t.meta.isKhmer ? "khmer-text" : ""}`}>
              {t.menu.modal.editTitle}
            </h2>

            <label
              className={`modal-label ${t.meta.isKhmer ? "khmer-text" : ""}`}
            >
              {t.menu.modal.itemImage}
            </label>
            <input
              type="file"
              accept="image/*"
              className="modal-input"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;

                if (editPreview && editPreview.startsWith("blob:")) {
                  URL.revokeObjectURL(editPreview);
                }

                setEditImage(file);
                setEditPreview(
                  file ? URL.createObjectURL(file) : editingItem.image_url || null
                );
              }}
            />

            {editPreview && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={editPreview}
                  alt={t.menu.modal.imagePreviewAlt}
                  className="modal-image-preview"
                />
              </>
            )}

            <label
              htmlFor="edit-name"
              className={`modal-label ${t.meta.isKhmer ? "khmer-text" : ""}`}
            >
              {t.menu.modal.name}
            </label>
            <input
              id="edit-name"
              className="modal-input"
              placeholder={t.menu.modal.namePlaceholder}
              value={editingItem.name}
              onChange={(e) =>
                setEditingItem({ ...editingItem, name: e.target.value })
              }
            />

            <label
              htmlFor="edit-description"
              className={`modal-label ${t.meta.isKhmer ? "khmer-text" : ""}`}
            >
              {t.menu.modal.description}
            </label>
            <textarea
              id="edit-description"
              className="modal-input"
              placeholder={t.menu.modal.descriptionPlaceholder}
              rows={2}
              style={{ resize: "none" }}
              value={editingItem.description || ""}
              onChange={(e) =>
                setEditingItem({ ...editingItem, description: e.target.value })
              }
            />

            <label
              className={`modal-label ${t.meta.isKhmer ? "khmer-text" : ""}`}
            >
              {t.menu.modal.category}
            </label>
            <div className="category-grid">
              <button
                type="button"
                className={`category-option ${
                  (((editingItem as MenuItem & { category?: MenuCategory })
                    .category ?? "cold") === "hot")
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setEditingItem({
                    ...editingItem,
                    category: "hot",
                  } as MenuItem)
                }
              >
                {t.menu.categories.hot}
              </button>

              <button
                type="button"
                className={`category-option ${
                  (((editingItem as MenuItem & { category?: MenuCategory })
                    .category ?? "cold") === "cold")
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setEditingItem({
                    ...editingItem,
                    category: "cold",
                  } as MenuItem)
                }
              >
                {t.menu.categories.cold}
              </button>

              <button
                type="button"
                className={`category-option ${
                  (((editingItem as MenuItem & { category?: MenuCategory })
                    .category ?? "cold") === "frappe")
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setEditingItem({
                    ...editingItem,
                    category: "frappe",
                  } as MenuItem)
                }
              >
                {t.menu.categories.frappe}
              </button>
            </div>

            <label
              htmlFor="edit-price"
              className={`modal-label ${t.meta.isKhmer ? "khmer-text" : ""}`}
            >
              {t.menu.modal.price}
            </label>
            <input
              id="edit-price"
              type="number"
              className="modal-input"
              placeholder="0.00"
              value={editingItem.price}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  price: parseFloat(e.target.value) || 0,
                })
              }
            />

            <div className="modal-actions">
              <button onClick={closeEditModal} className="modal-cancel">
                {t.menu.modal.cancel}
              </button>
              <button
                onClick={handleSaveEdit}
                className="modal-save"
                disabled={savingEdit}
              >
                {savingEdit ? t.menu.modal.saving : t.menu.modal.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}