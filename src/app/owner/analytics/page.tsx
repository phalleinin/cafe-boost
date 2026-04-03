"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useLocale } from "@/i18n/locale-context";

type AnalyticsSummary = {
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  popularItems: { name: string; count: number }[];
  recentOrders: {
    id: string;
    customer_name: string;
    total: number;
    status: string;
    created_at: string;
  }[];
};

export default function OwnerAnalyticPage() {
  const { t } = useLocale();

  const [cafeId, setCafeId] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          err instanceof Error ? err.message : t.analytics.failedToLoadProfile
        );
        setLoading(false);
      }
    };

    void init();
  }, [t.analytics.failedToLoadProfile]);

  useEffect(() => {
    if (!cafeId) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("id, customer_name, total, status, created_at")
          .eq("cafe_id", cafeId)
          .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;

        const orderIds = (orders || []).map((o) => o.id);

        const { data: orderItems, error: orderItemsError } = await supabase
          .from("order_items")
          .select("quantity, menus(name)")
          .in("order_id", orderIds);

        if (orderItemsError) throw orderItemsError;

        const itemMap: Record<string, number> = {};

        (orderItems || []).forEach(
          (oi: { quantity: number; menus: { name: string }[] | null }) => {
            const name = oi.menus?.[0]?.name || t.analytics.unknownItem;
            itemMap[name] = (itemMap[name] || 0) + oi.quantity;
          }
        );

        const popularItems = Object.entries(itemMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const allOrders = orders || [];
        const todayOrders = allOrders.filter(
          (o) => new Date(o.created_at) >= today
        );

        setData({
          totalOrders: allOrders.length,
          totalRevenue: allOrders.reduce((s, o) => s + o.total, 0),
          todayOrders: todayOrders.length,
          todayRevenue: todayOrders.reduce((s, o) => s + o.total, 0),
          popularItems,
          recentOrders: allOrders.slice(0, 5),
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t.analytics.failedToLoadAnalytics
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchAnalytics();
  }, [cafeId, t.analytics.failedToLoadAnalytics, t.analytics.unknownItem]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return {
          bg: "rgba(255,180,0,0.12)",
          color: "#B87800",
          label: t.orders.status.pending,
        };
      case "preparing":
        return {
          bg: "rgba(58,124,200,0.1)",
          color: "#2A6CB8",
          label: t.orders.status.preparing,
        };
      case "completed":
        return {
          bg: "rgba(40,160,90,0.1)",
          color: "#1A8A50",
          label: t.orders.status.completed,
        };
      default:
        return {
          bg: "rgba(0,0,0,0.05)",
          color: "#888",
          label: status,
        };
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
        <p
          style={{
            color: "rgba(26,15,0,0.35)",
            fontFamily: "'DM Sans', 'Noto Sans Khmer', sans-serif",
          }}
        >
          {t.analytics.loading}
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,600&family=DM+Sans:wght@300;400;500&family=Noto+Sans+Khmer:wght@300;400;500;600;700&display=swap');

        .dash {
          font-family: 'DM Sans', 'Noto Sans Khmer', sans-serif;
          color: #1A0F00;
        }

        .khmer-text {
          font-family: 'Noto Sans Khmer', 'DM Sans', sans-serif;
        }

        .error-msg {
          text-align: center;
          padding: 0 0 24px;
          font-size: 13px;
          color: #b42318;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .kpi-card {
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.15);
          border-radius: 16px;
          padding: 24px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .kpi-card:hover {
          border-color: rgba(200,135,58,0.35);
          box-shadow: 0 4px 16px rgba(200,135,58,0.08);
        }

        .kpi-label {
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(26,15,0,0.4);
          margin-bottom: 10px;
        }

        .kpi-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px;
          font-weight: 600;
          color: #1A0F00;
          line-height: 1;
          margin-bottom: 6px;
        }

        .kpi-accent { color: #C8873A; }

        .kpi-sub {
          font-size: 11px;
          color: rgba(26,15,0,0.3);
        }

        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .panel {
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.15);
          border-radius: 16px;
          padding: 24px;
        }

        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 16px;
          letter-spacing: 0.02em;
        }

        .popular-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .popular-item:last-child { border-bottom: none; }

        .popular-name {
          font-size: 13px;
          color: rgba(26,15,0,0.7);
          min-width: 80px;
        }

        .popular-bar-wrap {
          flex: 1;
          margin: 0 16px;
          height: 4px;
          background: rgba(0,0,0,0.06);
          border-radius: 2px;
          overflow: hidden;
        }

        .popular-bar {
          height: 100%;
          background: linear-gradient(90deg, #C8873A, #E8A050);
          border-radius: 2px;
        }

        .popular-count {
          font-size: 12px;
          color: #C8873A;
          font-weight: 500;
          min-width: 24px;
          text-align: right;
        }

        .order-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          gap: 12px;
        }

        .order-row:last-child { border-bottom: none; }

        .order-customer {
          font-size: 13px;
          color: rgba(26,15,0,0.7);
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .order-total {
          font-size: 13px;
          color: #C8873A;
          font-weight: 500;
          white-space: nowrap;
        }

        .status-badge {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 100px;
          white-space: nowrap;
        }

        .empty-state {
          font-size: 13px;
          color: rgba(26,15,0,0.25);
          text-align: center;
          padding: 24px 0;
        }

        @media (max-width: 768px) {
          .bottom-grid { grid-template-columns: 1fr; }
          .kpi-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="dash">
        {error && (
          <p className={`error-msg ${t.meta.isKhmer ? "khmer-text" : ""}`}>
            {error}
          </p>
        )}

        <div className="kpi-grid">
          <div className="kpi-card">
            <p className={`kpi-label ${t.meta.isKhmer ? "khmer-text" : ""}`}>
              {t.analytics.kpi.totalOrders}
            </p>
            <p className="kpi-value">{data?.totalOrders ?? 0}</p>
            <p className={`kpi-sub ${t.meta.isKhmer ? "khmer-text" : ""}`}>
              {t.analytics.kpi.allTime}
            </p>
          </div>

          <div className="kpi-card">
            <p className={`kpi-label ${t.meta.isKhmer ? "khmer-text" : ""}`}>
              {t.analytics.kpi.totalRevenue}
            </p>
            <p className="kpi-value kpi-accent">
              ${data?.totalRevenue.toFixed(2) ?? "0.00"}
            </p>
            <p className={`kpi-sub ${t.meta.isKhmer ? "khmer-text" : ""}`}>
              {t.analytics.kpi.allTime}
            </p>
          </div>

          <div className="kpi-card">
            <p className={`kpi-label ${t.meta.isKhmer ? "khmer-text" : ""}`}>
              {t.analytics.kpi.todayOrders}
            </p>
            <p className="kpi-value">{data?.todayOrders ?? 0}</p>
            <p className={`kpi-sub ${t.meta.isKhmer ? "khmer-text" : ""}`}>
              {t.analytics.kpi.sinceMidnight}
            </p>
          </div>

          <div className="kpi-card">
            <p className={`kpi-label ${t.meta.isKhmer ? "khmer-text" : ""}`}>
              {t.analytics.kpi.todayRevenue}
            </p>
            <p className="kpi-value kpi-accent">
              ${data?.todayRevenue.toFixed(2) ?? "0.00"}
            </p>
            <p className={`kpi-sub ${t.meta.isKhmer ? "khmer-text" : ""}`}>
              {t.analytics.kpi.sinceMidnight}
            </p>
          </div>
        </div>

        <div className="bottom-grid">
          <div className="panel">
            <h2 className={`section-title ${t.meta.isKhmer ? "khmer-text" : ""}`}>
              {t.analytics.sections.popularDrink}
            </h2>

            {data?.popularItems.length === 0 ? (
              <p className={`empty-state ${t.meta.isKhmer ? "khmer-text" : ""}`}>
                {t.analytics.empty.noOrderData}
              </p>
            ) : (
              data?.popularItems.map((item, i) => {
                const max = data.popularItems[0]?.count || 1;

                return (
                  <div key={i} className="popular-item">
                    <span className="popular-name">{item.name}</span>
                    <div className="popular-bar-wrap">
                      <div
                        className="popular-bar"
                        style={{ width: `${(item.count / max) * 100}%` }}
                      />
                    </div>
                    <span className="popular-count">×{item.count}</span>
                  </div>
                );
              })
            )}
          </div>

          <div className="panel">
            <h2 className={`section-title ${t.meta.isKhmer ? "khmer-text" : ""}`}>
              {t.analytics.sections.recentOrders}
            </h2>

            {data?.recentOrders.length === 0 ? (
              <p className={`empty-state ${t.meta.isKhmer ? "khmer-text" : ""}`}>
                {t.analytics.empty.noOrders}
              </p>
            ) : (
              data?.recentOrders.map((order) => {
                const s = getStatusColor(order.status);

                return (
                  <div key={order.id} className="order-row">
                    <span className="order-customer">{order.customer_name}</span>
                    <span className="order-total">${order.total.toFixed(2)}</span>
                    <span
                      className={`status-badge ${t.meta.isKhmer ? "khmer-text" : ""}`}
                      style={{ background: s.bg, color: s.color }}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}