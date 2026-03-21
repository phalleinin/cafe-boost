"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { MenuItem } from "@/types/menu";
import Link from "next/link";

export default function OwnerMenuPage() {
  const [cafeId, setCafeId] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = "/auth/signin"; return; }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("cafe_id")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        if (!profile?.cafe_id) { window.location.href = "/auth/setup-cafe"; return; }

        setCafeId(profile.cafe_id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
        setLoading(false);
      }
    };
    init();
  }, []);

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
        if (!cancelled) setMenu(data || []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error loading menu");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMenu();
    return () => { cancelled = true; };
  }, [cafeId]);

  const handleToggleAvailability = async (item: MenuItem) => {
    const { error } = await supabase
      .from("menus")
      .update({ is_available: !item.is_available })
      .eq("id", item.id);

    if (error) { alert("Failed to update availability"); return; }
    setMenu((prev) => prev.map((m) => m.id === item.id ? { ...m, is_available: !m.is_available } : m));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    setDeletingId(id);

    const { error } = await supabase.from("menus").delete().eq("id", id);
    if (error) { alert("Failed to delete item"); setDeletingId(null); return; }

    setMenu((prev) => prev.filter((m) => m.id !== id));
    setDeletingId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    const { error } = await supabase
      .from("menus")
      .update({
        name: editingItem.name,
        description: editingItem.description,
        price: editingItem.price,
        is_available: editingItem.is_available,
      })
      .eq("id", editingItem.id);

    if (error) { alert("Failed to update item"); return; }
    setMenu((prev) => prev.map((m) => m.id === editingItem.id ? editingItem : m));
    setEditingItem(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;600&family=DM+Sans:wght@300;400;500&display=swap');

        .menu-root {
          font-family: 'DM Sans', sans-serif;
          color: #1A0F00;
        }

        .menu-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .menu-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 4px;
        }

        .menu-sub {
          font-size: 13px;
          color: rgba(26,15,0,0.4);
          font-weight: 300;
        }

        .add-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #C8873A;
          color: #ffffff;
          padding: 10px 22px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 4px 12px rgba(200,135,58,0.25);
        }

        .add-btn:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .status-msg {
          font-size: 13px;
          color: rgba(26,15,0,0.35);
          padding: 32px 0;
          text-align: center;
        }

        .error-msg {
          font-size: 13px;
          color: #C03030;
          background: rgba(220,50,50,0.06);
          border: 1px solid rgba(220,50,50,0.15);
          padding: 10px 16px;
          border-radius: 10px;
          margin-bottom: 16px;
        }

        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .menu-card {
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.12);
          border-radius: 18px;
          padding: 24px;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }

        .menu-card:hover {
          border-color: rgba(200,135,58,0.25);
          box-shadow: 0 8px 24px rgba(200,135,58,0.08);
          transform: translateY(-2px);
        }

        .unavailable-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #C03030;
          background: rgba(220,50,50,0.08);
          border: 1px solid rgba(220,50,50,0.15);
          padding: 2px 10px;
          border-radius: 100px;
          margin-bottom: 12px;
        }

        .item-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 4px;
        }

        .item-desc {
          font-size: 12px;
          color: rgba(26,15,0,0.4);
          font-weight: 300;
          line-height: 1.5;
          margin-bottom: 12px;
          min-height: 18px;
        }

        .item-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          color: #C8873A;
          margin-bottom: 16px;
        }

        .card-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          padding-top: 12px;
          border-top: 1px solid rgba(200,135,58,0.08);
        }

        .btn {
          padding: 7px 14px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid;
          letter-spacing: 0.04em;
        }

        .btn-edit {
          background: rgba(200,135,58,0.08);
          color: #C8873A;
          border-color: rgba(200,135,58,0.25);
        }

        .btn-edit:hover {
          background: rgba(200,135,58,0.16);
        }

        .btn-delete {
          background: rgba(220,50,50,0.06);
          color: #C03030;
          border-color: rgba(220,50,50,0.2);
        }

        .btn-delete:hover {
          background: rgba(220,50,50,0.12);
        }

        .btn-delete:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .btn-toggle {
          background: rgba(26,15,0,0.04);
          color: rgba(26,15,0,0.5);
          border-color: rgba(26,15,0,0.1);
        }

        .btn-toggle:hover {
          background: rgba(26,15,0,0.08);
          color: rgba(26,15,0,0.7);
        }

        .qr-section {
          display: flex;
          justify-content: center;
          padding-top: 16px;
          border-top: 1px solid rgba(200,135,58,0.1);
        }

        .qr-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-decoration: none;
          transition: all 0.2s;
        }

        .qr-btn.active {
          background: #C8873A;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(200,135,58,0.25);
        }

        .qr-btn.active:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .qr-btn.disabled {
          background: rgba(26,15,0,0.06);
          color: rgba(26,15,0,0.25);
          pointer-events: none;
          cursor: not-allowed;
        }

        /* MODAL */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26,15,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 24px;
          backdrop-filter: blur(4px);
        }

        .modal-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 32px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.12);
          border: 1px solid rgba(200,135,58,0.15);
        }

        .modal-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 20px;
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
          padding: 10px 14px;
          border: 1px solid rgba(200,135,58,0.2);
          border-radius: 10px;
          background: #F7F3EE;
          color: #1A0F00;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          margin-bottom: 16px;
        }

        .modal-input:focus {
          border-color: rgba(200,135,58,0.45);
          box-shadow: 0 0 0 3px rgba(200,135,58,0.08);
          background: #ffffff;
        }

        .modal-input::placeholder {
          color: rgba(26,15,0,0.22);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 8px;
        }

        .modal-cancel {
          padding: 10px 20px;
          border-radius: 100px;
          border: 1px solid rgba(26,15,0,0.12);
          background: transparent;
          color: rgba(26,15,0,0.5);
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-cancel:hover {
          background: rgba(26,15,0,0.04);
          color: #1A0F00;
        }

        .modal-save {
          padding: 10px 24px;
          border-radius: 100px;
          border: none;
          background: #C8873A;
          color: #ffffff;
          font-size: 12px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s;
          letter-spacing: 0.04em;
        }

        .modal-save:hover { opacity: 0.88; }
      `}</style>

      <div className="menu-root">
        {/* Header */}
        <div className="menu-header">
          <div>
            <h1 className="menu-title">Manage Menu</h1>
            <p className="menu-sub">Add, edit, or remove items from your café menu.</p>
          </div>
          <Link href="/owner/menu/add" className="add-btn">
            + Add New Item
          </Link>
        </div>

        {loading && <p className="status-msg">Loading menu…</p>}
        {error && <div className="error-msg">{error}</div>}

        {!loading && !error && menu.length === 0 && (
          <p className="status-msg">No menu items yet. Add your first item!</p>
        )}

        {!loading && !error && menu.length > 0 && (
          <div className="menu-grid">
            {menu.map((item) => (
              <div key={item.id} className="menu-card">
                {!item.is_available && (
                  <span className="unavailable-badge">Unavailable</span>
                )}
                <h3 className="item-name">{item.name}</h3>
                <p className="item-desc">{item.description}</p>
                <p className="item-price">${item.price.toFixed(2)}</p>

                <div className="card-actions">
                  <button onClick={() => setEditingItem(item)} className="btn btn-edit">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="btn btn-delete"
                  >
                    {deletingId === item.id ? "Deleting..." : "Delete"}
                  </button>
                  <button onClick={() => handleToggleAvailability(item)} className="btn btn-toggle">
                    {item.is_available ? "Mark Unavailable" : "Mark Available"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QR Button */}
        <div className="qr-section">
          <Link
            href="/owner/menuQR"
            className={`qr-btn ${menu.length > 0 ? "active" : "disabled"}`}
          >
            ▣ Generate QR for Menu
          </Link>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 className="modal-title">Edit Menu Item</h2>

            <label htmlFor="edit-name" className="modal-label">Name</label>
            <input
              id="edit-name"
              className="modal-input"
              placeholder="Item name"
              value={editingItem.name}
              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
            />

            <label htmlFor="edit-description" className="modal-label">Description</label>
            <textarea
              id="edit-description"
              className="modal-input"
              placeholder="Item description"
              rows={2}
              style={{ resize: "none" }}
              value={editingItem.description || ""}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
            />

            <label htmlFor="edit-price" className="modal-label">Price</label>
            <input
              id="edit-price"
              type="number"
              className="modal-input"
              placeholder="0.00"
              value={editingItem.price}
              onChange={(e) =>
                setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })
              }
            />

            <div className="modal-actions">
              <button onClick={() => setEditingItem(null)} className="modal-cancel">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="modal-save">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}