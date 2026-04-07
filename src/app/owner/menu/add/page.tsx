"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { uploadMenuImage } from "@/lib/uploadImage";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/i18n/locale-context";

type MenuCategory = "hot" | "cold" | "frappe";

export default function AddMenuItemPage() {
  const router = useRouter();
  const { t } = useLocale();
  const submittingRef = useRef(false);

  const [cafeId, setCafeId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<MenuCategory>("cold");
  const [isAvailable, setIsAvailable] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth/signin";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("cafe_id")
        .eq("id", user.id)
        .single();

      if (!profile?.cafe_id) {
        window.location.href = "/auth/setup-cafe";
        return;
      }

      setCafeId(profile.cafe_id);
    };

    void init();
  }, []);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleAdd = async () => {
    if (loading || submittingRef.current) return;
    submittingRef.current = true;

    if (!name.trim()) {
      setError(t.menuAdd.errors.nameRequired);
      submittingRef.current = false;
      return;
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setError(t.menuAdd.errors.invalidPrice);
      submittingRef.current = false;
      return;
    }

    if (!cafeId) {
      setError(t.menuAdd.errors.noCafe);
      submittingRef.current = false;
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let imageUrl: string | null = null;

      if (image) {
        imageUrl = await uploadMenuImage(image);
      }

      const { error: insertError } = await supabase.from("menus").insert({
        cafe_id: cafeId,
        name: name.trim(),
        description: description.trim() || null,
        price: parseFloat(price),
        category,
        is_available: isAvailable,
        image_url: imageUrl,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;600&family=DM+Sans:wght@300;400;500;600&family=Noto+Sans+Khmer:wght@300;400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .add-root {
          font-family: 'DM Sans', 'Noto Sans Khmer', sans-serif;
          color: #1A0F00;
          width: 100%;
        }

        .content-wrap {
          width: 100%;
          max-width: none;
          padding-right: 40px;
        }

        .khmer-text {
          font-family: 'Noto Sans Khmer', 'DM Sans', sans-serif;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(26,15,0,0.45);
          text-decoration: none;
          letter-spacing: 0.03em;
          margin-bottom: 28px;
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .back-link:hover {
          color: #1A0F00;
          transform: translateX(-2px);
        }

        .page-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 52px;
          line-height: 0.95;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .page-sub {
          font-size: 17px;
          color: rgba(26,15,0,0.42);
          margin-bottom: 36px;
          font-weight: 300;
        }

        .form-card {
          background: rgba(255,255,255,0.86);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(200,135,58,0.14);
          border-radius: 28px;
          padding: 40px;
          box-shadow: 0 18px 44px rgba(26,15,0,0.05);
          width: 100%;
          max-width: none;
        }

        .error-msg {
          background: rgba(220,50,50,0.06);
          border: 1px solid rgba(220,50,50,0.15);
          color: #C03030;
          font-size: 13px;
          padding: 12px 14px;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 28px;
          align-items: start;
        }

        .field-group {
          margin-bottom: 18px;
        }

        .field-label {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
          color: rgba(26,15,0,0.56);
          font-weight: 600;
        }

        .field-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 16px;
          margin-bottom: 0;
          border: 1px solid rgba(26,15,0,0.10);
          background: #fff;
          color: #1A0F00;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .field-input:focus {
          border-color: rgba(200,135,58,0.45);
          box-shadow: 0 0 0 4px rgba(200,135,58,0.08);
          background: #fffdfa;
        }

        .field-input::placeholder {
          color: rgba(26,15,0,0.26);
        }

        textarea.field-input {
          resize: vertical;
          min-height: 140px;
        }

        .upload-shell {
          border: 1px dashed rgba(200,135,58,0.28);
          background: linear-gradient(135deg, rgba(247,242,235,0.8), rgba(255,255,255,0.9));
          border-radius: 20px;
          padding: 18px;
        }

        .upload-box {
          display: block;
          cursor: pointer;
        }

        .upload-input {
          display: none;
        }

        .upload-empty {
          height: 360px;
          border: 1px dashed rgba(200,135,58,0.28);
          border-radius: 18px;
          background: linear-gradient(135deg, #faf6f1, #fffdf9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: rgba(26,15,0,0.45);
          text-align: center;
        }

        .upload-icon {
          width: 56px;
          height: 56px;
          border-radius: 999px;
          background: rgba(200,135,58,0.12);
          color: #C8873A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin-bottom: 14px;
        }

        .upload-title {
          font-size: 18px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 6px;
        }

        .upload-sub {
          font-size: 13px;
          color: rgba(26,15,0,0.4);
        }

        .image-wrapper {
          width: 100%;
          height: 360px;
          overflow: hidden;
          border-radius: 18px;
          background: #f4efe8;
          position: relative;
        }

        .image-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transition: transform 0.35s ease;
        }

        .image-wrapper:hover .image-preview {
          transform: scale(1.03);
        }

        .image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(26,15,0,0.10) 0%,
            rgba(26,15,0,0.00) 45%
          );
          pointer-events: none;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
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

        .availability-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 6px 0 30px;
          font-size: 14px;
          padding: 14px 16px;
          border-radius: 16px;
          background: rgba(247,242,235,0.72);
          border: 1px solid rgba(200,135,58,0.10);
        }

        .availability-row input {
          width: 18px;
          height: 18px;
          accent-color: #C8873A;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .cancel-btn,
        .submit-btn {
          flex: 1;
          padding: 14px 18px;
          border-radius: 999px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: 0.2s ease;
        }

        .cancel-btn {
          background: #F7F2EB;
          color: #1A0F00;
          border: 1px solid rgba(200,135,58,0.15);
        }

        .cancel-btn:hover {
          background: #f2eadf;
        }

        .submit-btn {
          background: #C8873A;
          color: white;
          border: none;
          box-shadow: 0 10px 24px rgba(200,135,58,0.22);
        }

        .submit-btn:hover {
          opacity: 0.94;
          transform: translateY(-1px);
        }

        .cancel-btn:disabled,
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 1100px) {
          .content-wrap {
            padding-right: 24px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .upload-empty,
          .image-wrapper {
            height: 260px;
          }
        }

        @media (max-width: 640px) {
          .content-wrap {
            padding-right: 12px;
          }

          .page-title {
            font-size: 40px;
          }

          .page-sub {
            font-size: 15px;
          }

          .form-card {
            padding: 22px;
            border-radius: 22px;
          }

          .upload-empty,
          .image-wrapper {
            height: 200px;
          }

          .category-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="add-root">
        <div className="content-wrap">
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

            <div className="form-grid">
              <div>
                <div className="field-group">
                  <label className="field-label">{t.menuAdd.image}</label>
                  <div className="upload-shell">
                    <label className="upload-box">
                      <input
                        type="file"
                        accept="image/*"
                        className="upload-input"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;

                          if (preview && preview.startsWith("blob:")) {
                            URL.revokeObjectURL(preview);
                          }

                          setImage(file);
                          setPreview(file ? URL.createObjectURL(file) : null);
                        }}
                      />

                      {!preview ? (
                        <div className="upload-empty">
                          <div className="upload-icon">+</div>
                          <div className="upload-title">Choose item photo</div>
                          <div className="upload-sub">PNG, JPG, WEBP</div>
                        </div>
                      ) : (
                        <div className="image-wrapper">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preview}
                            alt={t.menuAdd.imagePreviewAlt}
                            className="image-preview"
                          />
                          <div className="image-overlay" />
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <div className="field-group">
                  <label className="field-label">{t.menuAdd.name}</label>
                  <input
                    type="text"
                    placeholder={t.menuAdd.namePlaceholder}
                    className="field-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">{t.menuAdd.description}</label>
                  <textarea
                    placeholder={t.menuAdd.descriptionPlaceholder}
                    className="field-input"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">{t.menuAdd.price}</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="field-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Category</label>
                  <div className="category-grid">
                    <button
                      type="button"
                      className={`category-option ${category === "hot" ? "active" : ""}`}
                      onClick={() => setCategory("hot")}
                    >
                      Hot
                    </button>
                    <button
                      type="button"
                      className={`category-option ${category === "cold" ? "active" : ""}`}
                      onClick={() => setCategory("cold")}
                    >
                      Cold
                    </button>
                    <button
                      type="button"
                      className={`category-option ${category === "frappe" ? "active" : ""}`}
                      onClick={() => setCategory("frappe")}
                    >
                      Frappe
                    </button>
                  </div>
                </div>

                <div className="availability-row">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                  />
                  <span className={t.meta.isKhmer ? "khmer-text" : ""}>
                    {t.menuAdd.available}
                  </span>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => router.push("/owner/menu")}
                    className="cancel-btn"
                    disabled={loading}
                  >
                    {t.menuAdd.cancel}
                  </button>

                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={loading}
                    className="submit-btn"
                  >
                    {loading ? t.menuAdd.adding : t.menuAdd.add}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}