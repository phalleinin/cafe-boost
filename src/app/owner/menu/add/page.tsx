"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/i18n/locale-context";

export default function AddMenuItemPage() {
  const router = useRouter();
  const { t } = useLocale();
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
    if (loading || submittingRef.current) return;
    submittingRef.current = true;

    if (!name.trim()) { setError(t.menuAdd.errors.nameRequired); return; }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setError(t.menuAdd.errors.invalidPrice); return;
    }
    if (!cafeId) { setError(t.menuAdd.errors.noCafe); return; }

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
      setError(err instanceof Error ? err.message : t.menuAdd.errors.failedAdd);
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;600&family=DM+Sans:wght@300;400;500&family=Noto+Sans+Khmer:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .add-root {
          font-family: 'DM Sans', 'Noto Sans Khmer', sans-serif;
          color: #1A0F00;
        }

        .khmer-text {
          font-family: 'Noto Sans Khmer', 'DM Sans', sans-serif;
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
        }

        .page-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .page-sub {
          font-size: 13px;
          color: rgba(26,15,0,0.4);
          margin-bottom: 32px;
        }

        .form-card {
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.15);
          border-radius: 20px;
          padding: 32px;
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
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 6px;
          display: block;
        }

        .field-input {
          width: 100%;
          padding: 11px 14px;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .availability-row {
          display: flex;
          gap: 10px;
          margin-bottom: 28px;
        }

        .form-actions {
          display: flex;
          gap: 10px;
        }

        .cancel-btn, .submit-btn {
          flex: 1;
          padding: 12px;
          border-radius: 100px;
          cursor: pointer;
        }

        .submit-btn {
          background: #C8873A;
          color: white;
        }
      `}</style>

      <div className="add-root">
        <Link href="/owner/menu" className="back-link">
          ← {t.menuAdd.back}
        </Link>

        <h1 className={`page-title ${t.meta.isKhmer ? "khmer-text" : ""}`}>
          {t.menuAdd.title}
        </h1>
        <p className={`page-sub ${t.meta.isKhmer ? "khmer-text" : ""}`}>
          {t.menuAdd.subtitle}
        </p>

        <div className="form-card">
          {error && <div className="error-msg">{error}</div>}

          <label className="field-label">{t.menuAdd.name}</label>
          <input
            type="text"
            placeholder={t.menuAdd.namePlaceholder}
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="field-label">{t.menuAdd.description}</label>
          <textarea
            placeholder={t.menuAdd.descriptionPlaceholder}
            className="field-input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className="field-label">{t.menuAdd.price}</label>
          <input
            type="number"
            placeholder="0.00"
            className="field-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <div className="availability-row">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
            <span>{t.menuAdd.available}</span>
          </div>

          <div className="form-actions">
            <button onClick={() => router.push("/owner/menu")} className="cancel-btn">
              {t.menuAdd.cancel}
            </button>

            <button onClick={handleAdd} disabled={loading} className="submit-btn">
              {loading ? t.menuAdd.adding : t.menuAdd.add}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}