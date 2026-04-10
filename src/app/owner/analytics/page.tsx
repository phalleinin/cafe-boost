"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { useLocale } from "@/i18n/locale-context";

type Period = "today" | "week" | "month";

type Order = {
  id: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
};

type RawOrderItem = {
  order_id: string;
  quantity: number;
  price: number;
  menus: { name: string }[] | null;
};

type MappedOrderItem = {
  order_id: string;
  quantity: number;
  price: number;
  menu_name: string;
};

type PopularItem = {
  name: string;
  count: number;
  revenue: number;
};

type DailyRevenue = {
  label: string;
  revenue: number;
  orders: number;
};

type HourlyOrder = {
  hour: number;
  count: number;
};

type AnalyticsSummary = {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  completionRate: number;
  popularItems: PopularItem[];
  recentOrders: Order[];
  dailyRevenue: DailyRevenue[];
  hourlyOrders: HourlyOrder[];
};

const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "7 Days" },
  { key: "month", label: "30 Days" },
];

function getPeriodStart(period: Period): Date {
  const d = new Date();
  if (period === "today") {
    d.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
  } else {
    d.setDate(d.getDate() - 29);
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

function buildDailyRevenue(orders: Order[], period: Period): DailyRevenue[] {
  const count = period === "today" ? 1 : period === "week" ? 7 : 30;
  const days: DailyRevenue[] = [];

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);

    const label =
      period === "today"
        ? "Today"
        : period === "week"
        ? d.toLocaleDateString("en-US", { weekday: "short" })
        : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const dayOrders = orders.filter((o) => {
      const t = new Date(o.created_at);
      return t >= d && t < next && o.status === "completed";
    });

    days.push({
      label,
      revenue: dayOrders.reduce((s, o) => s + o.total, 0),
      orders: dayOrders.length,
    });
  }
  return days;
}

function buildHourlyOrders(orders: Order[]): HourlyOrder[] {
  const hours: HourlyOrder[] = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
  orders.forEach((o) => {
    const h = new Date(o.created_at).getHours();
    hours[h].count++;
  });
  return hours;
}

export default function OwnerAnalyticPage() {
  const { t } = useLocale();
  const [cafeId, setCafeId] = useState<string | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<MappedOrderItem[]>([]);
  const [period, setPeriod] = useState<Period>("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(err instanceof Error ? err.message : t.analytics.failedToLoadProfile);
        setLoading(false);
      }
    };
    void init();
  }, [t.analytics.failedToLoadProfile]);

  useEffect(() => {
    if (!cafeId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("id, customer_name, total, status, created_at")
          .eq("cafe_id", cafeId)
          .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;

        const fetchedOrders: Order[] = orders || [];
        setAllOrders(fetchedOrders);

        const orderIds = fetchedOrders.map((o) => o.id);
        if (orderIds.length > 0) {
          const { data: items, error: itemsError } = await supabase
            .from("order_items")
            .select("order_id, quantity, price, menus(name)")
            .in("order_id", orderIds);

          if (itemsError) throw itemsError;

          const mapped: MappedOrderItem[] = ((items as RawOrderItem[]) || []).map((oi) => ({
            order_id: oi.order_id,
            quantity: oi.quantity,
            price: oi.price ?? 0,
            menu_name: oi.menus?.[0]?.name ?? t.analytics.unknownItem,
          }));

          setOrderItems(mapped);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : t.analytics.failedToLoadAnalytics);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [cafeId, t.analytics.failedToLoadAnalytics, t.analytics.unknownItem]);

  const data: AnalyticsSummary = useMemo(() => {
    const start = getPeriodStart(period);
    const filtered = allOrders.filter((o) => new Date(o.created_at) >= start);
    const completedOrders = filtered.filter((o) => o.status === "completed");

    const filteredIds = new Set(filtered.map((o) => o.id));
    const filteredItems = orderItems.filter((i) => filteredIds.has(i.order_id));

    const totalRevenue = completedOrders.reduce((s, o) => s + o.total, 0);
    const totalOrders = filtered.length;
    const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    const completionRate = totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 0;

    const itemMap: Record<string, { count: number; revenue: number }> = {};
    filteredItems.forEach((oi) => {
      if (!itemMap[oi.menu_name]) itemMap[oi.menu_name] = { count: 0, revenue: 0 };
      itemMap[oi.menu_name].count += oi.quantity;
      itemMap[oi.menu_name].revenue += oi.quantity * oi.price;
    });

    const popularItems: PopularItem[] = Object.entries(itemMap)
      .map(([name, v]) => ({ name, count: v.count, revenue: v.revenue }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      completionRate,
      popularItems,
      recentOrders: filtered.slice(0, 5),
      dailyRevenue: buildDailyRevenue(filtered, period),
      hourlyOrders: buildHourlyOrders(filtered),
    };
  }, [allOrders, orderItems, period]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":   return { bg: "rgba(255,180,0,0.12)",  color: "#B87800", label: t.orders.status.pending };
      case "preparing": return { bg: "rgba(58,124,200,0.10)", color: "#2A6CB8", label: t.orders.status.preparing };
      case "completed": return { bg: "rgba(40,160,90,0.10)",  color: "#1A8A50", label: t.orders.status.completed };
      default:          return { bg: "rgba(0,0,0,0.05)",      color: "#888",    label: status };
    }
  };

  const maxRevenue = Math.max(...data.dailyRevenue.map((d) => d.revenue), 1);
  const maxHourly  = Math.max(...data.hourlyOrders.map((h) => h.count), 1);

  const peakHour: HourlyOrder = data.hourlyOrders.reduce(
    (a, b) => (b.count > a.count ? b : a),
    data.hourlyOrders[0] ?? { hour: 0, count: 0 }
  );

  const circumference = 2 * Math.PI * 36;
  const ringOffset = circumference * (1 - data.completionRate / 100);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <p style={{ color: "rgba(26,15,0,0.35)", fontFamily: "'DM Sans', 'Noto Sans Khmer', sans-serif" }}>
          {t.analytics.loading}
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,600&family=DM+Sans:wght@300;400;500&family=Noto+Sans+Khmer:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .dash { font-family: 'DM Sans', 'Noto Sans Khmer', sans-serif; color: #1A0F00; max-width: 1100px; }
        .khmer-text { font-family: 'Noto Sans Khmer', 'DM Sans', sans-serif; }

        .period-bar { display: flex; gap: 6px; margin-bottom: 24px; }
        .period-btn {
          padding: 7px 18px; border-radius: 100px;
          border: 1px solid rgba(200,135,58,0.25); background: transparent;
          font-family: 'DM Sans', sans-serif; font-size: 12px;
          color: rgba(26,15,0,0.5); cursor: pointer;
          transition: all 0.18s; letter-spacing: 0.04em;
        }
        .period-btn:hover { border-color: rgba(200,135,58,0.5); color: #C8873A; }
        .period-btn.active { background: #C8873A; border-color: #C8873A; color: #fff; font-weight: 500; }

        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
        .kpi-card {
          background: #fff; border: 1px solid rgba(200,135,58,0.15);
          border-radius: 16px; padding: 20px 22px;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .kpi-card:hover { border-color: rgba(200,135,58,0.3); box-shadow: 0 4px 16px rgba(200,135,58,0.08); }
        .kpi-label { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(26,15,0,0.38); margin-bottom: 8px; }
        .kpi-value { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 600; color: #1A0F00; line-height: 1; margin-bottom: 4px; }
        .kpi-accent { color: #C8873A; }
        .kpi-sub { font-size: 10px; color: rgba(26,15,0,0.28); }

        .panel { background: #fff; border: 1px solid rgba(200,135,58,0.15); border-radius: 16px; padding: 22px 24px; }
        .section-title { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 600; color: #1A0F00; margin-bottom: 16px; letter-spacing: 0.02em; }

        .chart-bars { display: flex; align-items: flex-end; gap: 5px; height: 110px; padding-bottom: 4px; }
        .chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; }
        .chart-bar { width: 100%; border-radius: 5px 5px 0 0; background: linear-gradient(180deg, #E8A050, #C8873A); min-height: 3px; transition: opacity 0.15s; cursor: default; }
        .chart-bar:hover { opacity: 0.75; }
        .chart-bar-label { font-size: 9px; color: rgba(26,15,0,0.35); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; text-align: center; }
        .chart-zero { font-size: 11px; color: rgba(26,15,0,0.2); text-align: center; padding: 30px 0; }

        .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }

        .pop-item { display: flex; align-items: center; gap: 12px; padding: 9px 0; border-bottom: 1px solid rgba(0,0,0,0.05); }
        .pop-item:last-child { border-bottom: none; }
        .pop-rank { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 600; color: rgba(200,135,58,0.3); width: 20px; text-align: center; flex-shrink: 0; }
        .pop-info { flex: 1; min-width: 0; }
        .pop-name { font-size: 13px; color: #1A0F00; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pop-bar-wrap { height: 3px; background: rgba(0,0,0,0.06); border-radius: 2px; margin-top: 5px; }
        .pop-bar { height: 100%; background: linear-gradient(90deg, #C8873A, #E8A050); border-radius: 2px; }
        .pop-meta { text-align: right; flex-shrink: 0; }
        .pop-count { font-size: 13px; color: #C8873A; font-weight: 500; }
        .pop-rev { font-size: 10px; color: rgba(26,15,0,0.3); margin-top: 2px; }

        .order-row { display: flex; align-items: center; padding: 9px 0; border-bottom: 1px solid rgba(0,0,0,0.05); gap: 10px; }
        .order-row:last-child { border-bottom: none; }
        .order-customer { font-size: 13px; color: rgba(26,15,0,0.7); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .order-total { font-size: 13px; color: #C8873A; font-weight: 500; white-space: nowrap; }
        .order-time { font-size: 10px; color: rgba(26,15,0,0.28); white-space: nowrap; }
        .status-badge { font-size: 9px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 9px; border-radius: 100px; white-space: nowrap; }

        .completion-ring-wrap { display: flex; align-items: center; gap: 20px; }
        .completion-pct { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 600; color: #1A8A50; line-height: 1; }
        .completion-label { font-size: 11px; color: rgba(26,15,0,0.4); margin-top: 4px; letter-spacing: 0.06em; text-transform: uppercase; }

        .heatmap-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 4px; }
        .heat-cell { aspect-ratio: 1; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 8px; transition: transform 0.15s; cursor: default; }
        .heat-cell:hover { transform: scale(1.15); z-index: 1; }
        .heatmap-labels { display: grid; grid-template-columns: repeat(12, 1fr); gap: 4px; margin-top: 4px; }
        .heat-label { text-align: center; font-size: 8px; color: rgba(26,15,0,0.3); }

        .empty-state { font-size: 12px; color: rgba(26,15,0,0.25); text-align: center; padding: 20px 0; }
        .error-msg { font-size: 13px; color: #b42318; text-align: center; padding: 0 0 20px; }

        @media (max-width: 900px) {
          .kpi-grid { grid-template-columns: 1fr 1fr; }
          .row-2 { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .heatmap-grid, .heatmap-labels { grid-template-columns: repeat(8, 1fr); }
        }
      `}</style>

      <div className="dash">
        {error && !data.totalOrders && <p className="error-msg">{error}</p>}

        {/* Period Toggle */}
        <div className="period-bar">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              className={`period-btn ${period === p.key ? "active" : ""}`}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <p className="kpi-label">Total Orders</p>
            <p className="kpi-value">{data.totalOrders}</p>
            <p className="kpi-sub">in selected period</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Total Revenue</p>
            <p className="kpi-value kpi-accent">${data.totalRevenue.toFixed(2)}</p>
            <p className="kpi-sub">completed orders only</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Avg Order Value</p>
            <p className="kpi-value">${data.avgOrderValue.toFixed(2)}</p>
            <p className="kpi-sub">completed orders only</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Peak Hour</p>
            <p className="kpi-value kpi-accent">
              {peakHour.count > 0
                ? `${String(peakHour.hour).padStart(2, "0")}:00`
                : "—"}
            </p>
            <p className="kpi-sub">
              {peakHour.count > 0 ? `${peakHour.count} orders` : "no data"}
            </p>
          </div>
        </div>

        {/* Revenue Chart + Completion Rate */}
        <div className="row-2">
          <div className="panel">
            <h2 className="section-title">Daily Revenue</h2>
            {data.totalOrders === 0 ? (
              <p className="chart-zero">No orders in this period</p>
            ) : (
              <>
                <div className="chart-bars">
                  {data.dailyRevenue.map((d, i) => (
                    <div key={i} className="chart-col">
                      <div
                        className="chart-bar"
                        style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                        title={`$${d.revenue.toFixed(2)} · ${d.orders} completed`}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                  {data.dailyRevenue.map((d, i) => (
                    <div key={i} className="chart-bar-label" style={{ flex: 1 }}>
                      {period === "month" && data.dailyRevenue.length > 14
                        ? i % 5 === 0 ? d.label : ""
                        : d.label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="panel">
            <h2 className="section-title">Order Completion</h2>
            <div className="completion-ring-wrap">
              <svg width="90" height="90" style={{ flexShrink: 0 }}>
                <circle
                  cx="45" cy="45" r="36"
                  fill="none"
                  stroke="rgba(0,0,0,0.06)"
                  strokeWidth="8"
                />
                <circle
                  cx="45" cy="45" r="36"
                  fill="none"
                  stroke="#1A8A50"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={String(circumference)}
                  strokeDashoffset={String(ringOffset)}
                  transform="rotate(-90 45 45)"
                />
              </svg>
              <div>
                <p className="completion-pct">{data.completionRate.toFixed(0)}%</p>
                <p className="completion-label">Completed</p>
                <p className="kpi-sub" style={{ marginTop: 6 }}>
                  {data.totalOrders === 0 ? "No orders yet" : `${data.totalOrders} total orders`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Drinks + Recent Orders */}
        <div className="row-2">
          <div className="panel">
            <h2 className="section-title">Popular Drinks</h2>
            {data.popularItems.length === 0 ? (
              <p className="empty-state">No order data yet</p>
            ) : (
              data.popularItems.map((item, i) => {
                const max = data.popularItems[0]?.count ?? 1;
                return (
                  <div key={i} className="pop-item">
                    <span className="pop-rank">{i + 1}</span>
                    <div className="pop-info">
                      <div className="pop-name">{item.name}</div>
                      <div className="pop-bar-wrap">
                        <div
                          className="pop-bar"
                          style={{ width: `${(item.count / max) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="pop-meta">
                      <div className="pop-count">x{item.count}</div>
                      <div className="pop-rev">${item.revenue.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="panel">
            <h2 className="section-title">Recent Orders</h2>
            {data.recentOrders.length === 0 ? (
              <p className="empty-state">No orders in this period</p>
            ) : (
              data.recentOrders.map((order) => {
                const s = getStatusStyle(order.status);
                const mins = Math.floor(
                  (Date.now() - new Date(order.created_at).getTime()) / 60000
                );
                const timeAgo =
                  mins < 60
                    ? `${mins}m ago`
                    : mins < 1440
                    ? `${Math.floor(mins / 60)}h ago`
                    : `${Math.floor(mins / 1440)}d ago`;

                return (
                  <div key={order.id} className="order-row">
                    <span className="order-customer">{order.customer_name}</span>
                    <span className="order-total">${order.total.toFixed(2)}</span>
                    <span className="order-time">{timeAgo}</span>
                    <span
                      className="status-badge"
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

        {/* Busiest Hours Heatmap */}
        <div className="panel">
          <h2 className="section-title">Busiest Hours</h2>
          {data.totalOrders === 0 ? (
            <p className="empty-state">No order data yet</p>
          ) : (
            <>
              <div className="heatmap-grid">
                {data.hourlyOrders.slice(0, 12).map((h) => {
                  const intensity = h.count / maxHourly;
                  const bg =
                    intensity === 0
                      ? "rgba(0,0,0,0.04)"
                      : `rgba(200,135,58,${(0.1 + intensity * 0.85).toFixed(2)})`;
                  const textColor =
                    intensity > 0.6 ? "#fff" : "rgba(26,15,0,0.45)";
                  return (
                    <div
                      key={h.hour}
                      className="heat-cell"
                      style={{ background: bg, color: textColor }}
                      title={`${String(h.hour).padStart(2, "0")}:00 — ${h.count} orders`}
                    >
                      {h.count > 0 ? h.count : ""}
                    </div>
                  );
                })}
              </div>
              <div className="heatmap-labels">
                {data.hourlyOrders.slice(0, 12).map((h) => (
                  <div key={h.hour} className="heat-label">
                    {String(h.hour).padStart(2, "0")}
                  </div>
                ))}
              </div>

              <div className="heatmap-grid" style={{ marginTop: 10 }}>
                {data.hourlyOrders.slice(12).map((h) => {
                  const intensity = h.count / maxHourly;
                  const bg =
                    intensity === 0
                      ? "rgba(0,0,0,0.04)"
                      : `rgba(200,135,58,${(0.1 + intensity * 0.85).toFixed(2)})`;
                  const textColor =
                    intensity > 0.6 ? "#fff" : "rgba(26,15,0,0.45)";
                  return (
                    <div
                      key={h.hour}
                      className="heat-cell"
                      style={{ background: bg, color: textColor }}
                      title={`${String(h.hour).padStart(2, "0")}:00 — ${h.count} orders`}
                    >
                      {h.count > 0 ? h.count : ""}
                    </div>
                  );
                })}
              </div>
              <div className="heatmap-labels">
                {data.hourlyOrders.slice(12).map((h) => (
                  <div key={h.hour} className="heat-label">
                    {String(h.hour).padStart(2, "0")}
                  </div>
                ))}
              </div>

              <p style={{ fontSize: 10, color: "rgba(26,15,0,0.25)", marginTop: 10 }}>
                Darker = more orders · Hover a cell to see the exact count
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}