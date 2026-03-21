"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddMenuItemPage() {
  const router = useRouter();
  const submittingRef = useRef(false);

  const [cafeId, setCafeId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/auth/signin"; return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("cafe_id")
        .eq("id", user.id)
        .single();

      if (!profile?.cafe_id) { window.location.href = "/auth/setup-cafe"; return; }
      setCafeId(profile.cafe_id);
    };

    init();
  }, []);

  const handleAdd = async () => {
      console.log("handleAdd called, submittingRef:", submittingRef.current);
      if (loading || submittingRef.current) return;// ✅ ref guard prevents double submit
    submittingRef.current = true;

    if (!name.trim()) { setError("Item name is required."); return; }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setError("Please enter a valid price."); return;
    }
    if (!cafeId) { setError("Café not found. Please try again."); return; }

    try {
      setLoading(true);
      setError(null);

      const { error: insertError } = await supabase
        .from("menus")
        .insert({
          cafe_id: cafeId,
          name: name.trim(),
          description: description.trim() || null,
          price: parseFloat(price),
          is_available: isAvailable,
        });

      if (insertError) throw new Error(insertError.message);
      router.push("/owner/menu");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item.");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;600&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .add-root {
          font-family: 'DM Sans', sans-serif;
          color: #1A0F00;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: rgba(26,15,0,0.4);
          text-decoration: none;
          letter-spacing: 0.04em;
          margin-bottom: 24px;
          transition: color 0.2s;
        }

        .back-link:hover { color: #C8873A; }

        .page-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 4px;
        }

        .page-sub {
          font-size: 13px;
          color: rgba(26,15,0,0.4);
          font-weight: 300;
          margin-bottom: 32px;
        }

        .form-card {
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.15);
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .error-msg {
          background: rgba(220,50,50,0.06);
          border: 1px solid rgba(220,50,50,0.15);
          color: #C03030;
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(26,15,0,0.45);
          margin-bottom: 6px;
        }

        .field-input {
          width: 100%;
          padding: 11px 14px;
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

        .field-input::placeholder { color: rgba(26,15,0,0.22); }

        .field-input:focus {
          border-color: rgba(200,135,58,0.45);
          box-shadow: 0 0 0 3px rgba(200,135,58,0.08);
          background: #ffffff;
        }

        .availability-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          border: 1px solid rgba(200,135,58,0.15);
          border-radius: 10px;
          background: #F7F3EE;
          margin-bottom: 28px;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .availability-row:hover {
          border-color: rgba(200,135,58,0.3);
        }

        .availability-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #C8873A;
          cursor: pointer;
        }

        .availability-label {
          font-size: 13px;
          color: rgba(26,15,0,0.6);
          cursor: pointer;
          user-select: none;
        }

        .form-actions {
          display: flex;
          gap: 10px;
        }

        .cancel-btn {
          flex: 1;
          padding: 12px;
          border-radius: 100px;
          border: 1px solid rgba(26,15,0,0.12);
          background: transparent;
          color: rgba(26,15,0,0.5);
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-btn:hover {
          background: rgba(26,15,0,0.04);
          color: #1A0F00;
        }

        .submit-btn {
          flex: 1;
          padding: 12px;
          border-radius: 100px;
          border: none;
          background: #C8873A;
          color: #ffffff;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          letter-spacing: 0.04em;
          box-shadow: 0 4px 12px rgba(200,135,58,0.25);
        }

        .submit-btn:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          box-shadow: none;
        }
      `}</style>

      <div className="add-root">
        <Link href="/owner/menu" className="back-link">
          ← Back to Menu
        </Link>

        <h1 className="page-title">Add Menu Item</h1>
        <p className="page-sub">Fill in the details for your new menu item.</p>

        <div className="form-card">
          {error && <div className="error-msg">{error}</div>}

          <label htmlFor="item-name" className="field-label">Item Name *</label>
          <input
            id="item-name"
            type="text"
            placeholder="e.g. Matcha Latte"
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="item-description" className="field-label">Description</label>
          <textarea
            id="item-description"
            placeholder="e.g. Creamy matcha with oat milk"
            className="field-input"
            style={{ resize: "none" }}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label htmlFor="item-price" className="field-label">Price *</label>
          <input
            id="item-price"
            type="number"
            placeholder="0.00"
            className="field-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
            required
          />

          <div className="availability-row">
            <input
              id="item-available"
              type="checkbox"
              className="availability-checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
            <label htmlFor="item-available" className="availability-label">
              Available immediately
            </label>
          </div>

          <div className="form-actions">
            <button
              onClick={() => router.push("/owner/menu")}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={loading || !cafeId}
              className="submit-btn"
            >
              {loading ? "Adding..." : "Add Item"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}