"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

type OrderItem = {
  id: string;
  menu_id: string;
  quantity: number;
  unit_price: number;
  notes: string | null;
  menus: { name: string } | null;
};

type Order = {
  id: string;
  customer_name: string;
  status: string;
  payment_method: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
};

export default function OwnerOrdersPage() {
  const [cafeId, setCafeId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("active");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

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

  const fetchOrders = useCallback(async () => {
    if (!cafeId) return;
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id, customer_name, status, payment_method, total, created_at,
          order_items (
            id, menu_id, quantity, unit_price, notes,
            menus ( name )
          )
        `)
        .eq("cafe_id", cafeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as unknown as Order[]) || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading orders");
    } finally {
      setLoading(false);
    }
  }, [cafeId]);

  // ✅ Auto-refresh every 30 seconds — owner sees new orders without manual reload
  useEffect(() => {
    if (!cafeId) return;
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [cafeId, fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
      );
    } catch (err) {
      alert("Failed to update order status.");
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending": return { bg: "rgba(255,180,0,0.12)", color: "#B87800", label: "New Order" };
      case "preparing": return { bg: "rgba(58,124,200,0.12)", color: "#2A6CB8", label: "Preparing" };
      case "completed": return { bg: "rgba(40,160,90,0.12)", color: "#1A8A50", label: "Done" };
      default: return { bg: "rgba(0,0,0,0.05)", color: "#888", label: status };
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const activeOrders = orders.filter((o) => o.status !== "completed");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const todayRevenue = completedOrders.reduce((s, o) => s + o.total, 0);

  const filteredOrders = filterStatus === "active" ? activeOrders
    : filterStatus === "completed" ? completedOrders
    : orders;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;600&family=DM+Sans:wght@300;400;500&display=swap');

        .orders-root { font-family: 'DM Sans', sans-serif; color: #1A0F00; }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .page-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 2px;
        }

        .page-sub {
          font-size: 12px;
          color: rgba(26,15,0,0.35);
        }

        .refresh-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: rgba(26,15,0,0.4);
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.15);
          padding: 6px 14px;
          border-radius: 100px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }

        .refresh-btn:hover { color: #C8873A; border-color: rgba(200,135,58,0.35); }

        .last-updated {
          font-size: 11px;
          color: rgba(26,15,0,0.25);
        }

        /* KPI strip */
        .kpi-strip {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .kpi-card {
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.12);
          border-radius: 14px;
          padding: 16px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.03);
        }

        .kpi-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          line-height: 1;
          margin-bottom: 4px;
        }

        .kpi-label {
          font-size: 11px;
          color: rgba(26,15,0,0.35);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* Alert banner for new orders */
        .new-orders-alert {
          background: rgba(255,180,0,0.08);
          border: 1px solid rgba(255,180,0,0.3);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #B87800;
          font-weight: 500;
        }

        .alert-dot {
          width: 8px;
          height: 8px;
          background: #FFB400;
          border-radius: 50%;
          animation: pulse 1s infinite;
          flex-shrink: 0;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        /* Filters */
        .filters {
          display: flex;
          gap: 6px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 7px 16px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid rgba(200,135,58,0.2);
          background: #ffffff;
          color: rgba(26,15,0,0.45);
        }

        .filter-btn:hover { color: #C8873A; border-color: rgba(200,135,58,0.35); }
        .filter-btn.active { background: #C8873A; color: #ffffff; border-color: #C8873A; }

        /* Order cards */
        .orders-list { display: flex; flex-direction: column; gap: 12px; }

        .order-card {
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.12);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          transition: box-shadow 0.2s;
        }

        .order-card.pending {
          border-left: 4px solid #FFB400;
          box-shadow: 0 2px 12px rgba(255,180,0,0.1);
        }

        .order-card.preparing { border-left: 4px solid #3A7CC8; }
        .order-card.completed { border-left: 4px solid #3AC87C; opacity: 0.75; }

        .order-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 16px 20px 12px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .order-customer-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }

        .order-customer {
          font-size: 16px;
          font-weight: 500;
          color: #1A0F00;
        }

        .status-badge {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 100px;
        }

        .order-time {
          font-size: 12px;
          color: rgba(26,15,0,0.35);
        }

        .order-summary {
          text-align: right;
        }

        .order-total {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 600;
          color: #C8873A;
          line-height: 1;
        }

        .order-payment-method {
          font-size: 11px;
          color: rgba(26,15,0,0.3);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-top: 2px;
        }

        /* Items — always visible, no expand needed */
        .order-items {
          padding: 0 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .item-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #F7F3EE;
          border: 1px solid rgba(200,135,58,0.1);
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 13px;
          color: #1A0F00;
        }

        .item-qty {
          font-size: 11px;
          font-weight: 600;
          color: #C8873A;
          background: rgba(200,135,58,0.1);
          border-radius: 4px;
          padding: 1px 6px;
        }

        .item-notes {
          font-size: 11px;
          color: rgba(26,15,0,0.4);
        }

        /* Action bar */
        .order-actions {
          display: flex;
          gap: 8px;
          padding: 12px 20px 16px;
          border-top: 1px solid rgba(200,135,58,0.06);
          flex-wrap: wrap;
        }

        .action-btn {
          flex: 1;
          padding: 10px 16px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid;
          letter-spacing: 0.04em;
          text-align: center;
          min-width: 120px;
        }

        .action-btn.start {
          background: rgba(255,180,0,0.1);
          color: #B87800;
          border-color: rgba(255,180,0,0.35);
        }

        .action-btn.start:hover { background: rgba(255,180,0,0.18); }

        .action-btn.complete {
          background: #1A8A50;
          color: #ffffff;
          border-color: #1A8A50;
          box-shadow: 0 4px 12px rgba(40,160,90,0.2);
        }

        .action-btn.complete:hover { opacity: 0.88; }

        .action-btn.done-label {
          background: rgba(40,160,90,0.08);
          color: #1A8A50;
          border-color: rgba(40,160,90,0.2);
          cursor: default;
        }

        .action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          padding: 48px 0;
          font-size: 13px;
          color: rgba(26,15,0,0.25);
        }

        .status-msg {
          text-align: center;
          padding: 32px 0;
          font-size: 13px;
          color: rgba(26,15,0,0.35);
        }
      `}</style>

      <div className="orders-root">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Orders</h1>
            <p className="page-sub">Auto-refreshes every 30 seconds</p>
          </div>
          <div className="refresh-info">
            <span className="last-updated">
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <button className="refresh-btn" onClick={fetchOrders}>
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* KPI strip */}
        {!loading && (
          <div className="kpi-strip">
            <div className="kpi-card">
              <p className="kpi-value" style={{ color: "#B87800" }}>{pendingCount}</p>
              <p className="kpi-label">New Orders</p>
            </div>
            <div className="kpi-card">
              <p className="kpi-value" style={{ color: "#2A6CB8" }}>{preparingCount}</p>
              <p className="kpi-label">Preparing</p>
            </div>
            <div className="kpi-card">
              <p className="kpi-value" style={{ color: "#C8873A" }}>${todayRevenue.toFixed(2)}</p>
              <p className="kpi-label">Collected</p>
            </div>
            <div className="kpi-card">
              <p className="kpi-value">{orders.length}</p>
              <p className="kpi-label">Total Today</p>
            </div>
          </div>
        )}

        {/* Alert for pending orders */}
        {pendingCount > 0 && (
          <div className="new-orders-alert">
            <span className="alert-dot" />
            {pendingCount} new order{pendingCount > 1 ? "s" : ""} waiting — tap &quot;Start Preparing&quot; to begin
          </div>
        )}

        {/* Filters */}
        <div className="filters">
          {[
            { key: "active", label: `Active (${activeOrders.length})` },
            { key: "completed", label: `Completed (${completedOrders.length})` },
            { key: "all", label: "All Orders" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`filter-btn ${filterStatus === f.key ? "active" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && <p className="status-msg">Loading orders…</p>}

        {!loading && filteredOrders.length === 0 && (
          <p className="empty-state">
            {filterStatus === "active" ? "No active orders right now." : "No orders found."}
          </p>
        )}

        {/* Orders list */}
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const s = getStatusStyle(order.status);
            return (
              <div key={order.id} className={`order-card ${order.status}`}>

                {/* Top row */}
                <div className="order-top">
                  <div>
                    <div className="order-customer-row">
                      <span className="order-customer">{order.customer_name}</span>
                      <span
                        className="status-badge"
                        style={{ background: s.bg, color: s.color }}
                      >
                        {s.label}
                      </span>
                    </div>
                    <p className="order-time">{formatTime(order.created_at)}</p>
                  </div>
                  <div className="order-summary">
                    <p className="order-total">${order.total.toFixed(2)}</p>
                    <p className="order-payment-method">{order.payment_method}</p>
                  </div>
                </div>

                {/* Items — always visible so owner knows what to make */}
                <div className="order-items">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="item-chip">
                      <span className="item-qty">×{item.quantity}</span>
                      <span>{item.menus?.name || "Unknown"}</span>
                      {item.notes && (
                        <span className="item-notes">— {item.notes}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="order-actions">
                  {order.status === "pending" && (
                    <button
                      className="action-btn start"
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusUpdate(order.id, "preparing")}
                    >
                      {updatingId === order.id ? "Updating..." : "▶ Start Preparing"}
                    </button>
                  )}
                  {order.status === "preparing" && (
                    <button
                      className="action-btn complete"
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusUpdate(order.id, "completed")}
                    >
                      {updatingId === order.id ? "Updating..." : "✓ Mark as Completed"}
                    </button>
                  )}
                  {order.status === "completed" && (
                    <span className="action-btn done-label">✓ Completed & Paid</span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}