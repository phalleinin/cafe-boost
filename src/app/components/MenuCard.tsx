"use client";

import type { MenuItem } from "@/types/menu";

type MenuCardProps = {
  item: MenuItem;
  isOrderEnabled?: boolean;
  onAddToCart?: (item: MenuItem) => void;
};

type MenuCategory = "hot" | "cold" | "frappe";

export default function MenuCard({
  item,
  isOrderEnabled = false,
  onAddToCart,
}: MenuCardProps) {
  const normalizedCategory = (
    item as MenuItem & { category?: string | null }
  ).category?.toLowerCase();

  const category =
    normalizedCategory === "hot" ||
    normalizedCategory === "cold" ||
    normalizedCategory === "frappe"
      ? (normalizedCategory as MenuCategory)
      : null;

  const categoryLabel =
    category === "hot"
      ? "Hot"
      : category === "cold"
        ? "Cold"
        : category === "frappe"
          ? "Frappe"
          : null;

  return (
    <>
      <style>{`
        .qr-menu-card {
          background: rgba(255,255,255,0.88);
          border: 1px solid rgba(200, 135, 58, 0.12);
          border-radius: 28px;
          padding: 16px;
          box-shadow: 0 10px 28px rgba(26, 15, 0, 0.06);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }

        .qr-menu-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(26, 15, 0, 0.08);
          border-color: rgba(200, 135, 58, 0.2);
        }

        .qr-menu-image-wrap {
          position: relative;
          width: 100%;
          height: 260px;
          border-radius: 22px;
          background: linear-gradient(180deg, #fbf8f3 0%, #f2ebe2 100%);
          border: 1px solid rgba(200, 135, 58, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 20px;
          margin-bottom: 16px;
        }

        .qr-menu-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
          filter: drop-shadow(0 12px 18px rgba(55, 34, 12, 0.10));
          transition: transform 0.25s ease;
        }

        .qr-menu-card:hover .qr-menu-image {
          transform: scale(1.02);
        }

        .qr-menu-image-fallback {
          width: 100%;
          height: 260px;
          border-radius: 22px;
          background: linear-gradient(135deg, #f6f0e8, #efe4d4);
          border: 1px solid rgba(200, 135, 58, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(26, 15, 0, 0.34);
          font-size: 13px;
          margin-bottom: 16px;
        }

        .qr-menu-category {
          display: inline-flex;
          align-items: center;
          align-self: flex-start;
          margin-bottom: 10px;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1px solid rgba(200, 135, 58, 0.14);
          background: rgba(200, 135, 58, 0.08);
          color: #A76C27;
        }

        .qr-menu-category.hot {
          background: rgba(200, 80, 40, 0.10);
          border-color: rgba(200, 80, 40, 0.16);
          color: #B14D2F;
        }

        .qr-menu-category.cold {
          background: rgba(70, 120, 200, 0.10);
          border-color: rgba(70, 120, 200, 0.16);
          color: #3B6CB7;
        }

        .qr-menu-category.frappe {
          background: rgba(120, 90, 180, 0.10);
          border-color: rgba(120, 90, 180, 0.16);
          color: #6E4DB0;
        }

        .qr-menu-name {
          margin: 0 0 8px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 34px;
          line-height: 0.95;
          font-weight: 600;
          color: #1A0F00;
        }

        .qr-menu-desc {
          margin: 0;
          min-height: 44px;
          font-size: 14px;
          line-height: 1.6;
          color: rgba(26, 15, 0, 0.55);
        }

        .qr-menu-footer {
          margin-top: auto;
          padding-top: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .qr-menu-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 38px;
          line-height: 1;
          font-weight: 600;
          color: #C8873A;
          white-space: nowrap;
        }

        .qr-menu-order-btn {
          border: none;
          border-radius: 999px;
          background: #C8873A;
          color: #ffffff;
          padding: 11px 18px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(200,135,58,0.24);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .qr-menu-order-btn:hover {
          opacity: 0.92;
          transform: translateY(-1px);
        }

        @media (max-width: 640px) {
          .qr-menu-image-wrap,
          .qr-menu-image-fallback {
            height: 230px;
            padding: 16px;
          }

          .qr-menu-name {
            font-size: 30px;
          }

          .qr-menu-price {
            font-size: 34px;
          }
        }
      `}</style>

      <article className="qr-menu-card">
        {item.image_url ? (
          <div className="qr-menu-image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt={item.name}
              className="qr-menu-image"
            />
          </div>
        ) : (
          <div className="qr-menu-image-fallback">No Image</div>
        )}

        {categoryLabel && (
          <div className={`qr-menu-category ${category}`}>
            {categoryLabel}
          </div>
        )}

        <h3 className="qr-menu-name">{item.name}</h3>

        <p className="qr-menu-desc">
          {item.description?.trim() || "No description available."}
        </p>

        <div className="qr-menu-footer">
          <div className="qr-menu-price">${item.price.toFixed(2)}</div>

          {isOrderEnabled && onAddToCart && (
            <button
              type="button"
              className="qr-menu-order-btn"
              onClick={() => onAddToCart(item)}
            >
              Add to Order
            </button>
          )}
        </div>
      </article>
    </>
  );
}