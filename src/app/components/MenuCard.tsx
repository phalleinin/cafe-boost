// components/MenuCard.tsx
import type { MenuItem } from "@/types/menu";

interface Props {
  item: MenuItem;
  isOrderEnabled?: boolean;
  onAddToCart?: (item: MenuItem) => void;
}

export default function MenuCard({ item, isOrderEnabled, onAddToCart }: Props) {
  return (
    <>
      <style>{`
        .menu-card {
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.12);
          border-radius: 18px;
          padding: 24px;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
        }

        .menu-card:hover {
          border-color: rgba(200,135,58,0.28);
          box-shadow: 0 8px 24px rgba(200,135,58,0.09);
          transform: translateY(-2px);
        }

        .menu-card-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 6px;
          letter-spacing: 0.01em;
        }

        .menu-card-desc {
          font-size: 12px;
          color: rgba(26,15,0,0.4);
          font-weight: 300;
          line-height: 1.5;
          margin-bottom: 16px;
          flex: 1;
        }

        .menu-card-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          color: #C8873A;
          margin-bottom: 16px;
        }

        .menu-card-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: rgba(200,135,58,0.08);
          color: #C8873A;
          border: 1px solid rgba(200,135,58,0.25);
          padding: 10px 20px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          width: 100%;
        }

        .menu-card-btn:hover {
          background: #C8873A;
          color: #ffffff;
          border-color: #C8873A;
          box-shadow: 0 4px 12px rgba(200,135,58,0.25);
        }
      `}</style>

      <div className="menu-card">
        <h3 className="menu-card-name">{item.name}</h3>
        <p className="menu-card-desc">{item.description || "Delicious café item"}</p>
        <p className="menu-card-price">${item.price.toFixed(2)}</p>

        {isOrderEnabled && onAddToCart && (
          <button
            onClick={() => onAddToCart(item)}
            className="menu-card-btn"
          >
            + Add to Order
          </button>
        )}
      </div>
    </>
  );
}