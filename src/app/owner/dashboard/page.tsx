"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type OrderItem = {
  id: string;
  menu_id: string;
  quantity: number;
  unit_price: number;
  notes: string | null;
  menus: { name: string } | null;
};

type OrderStatus = "pending" | "preparing" | "completed";

type Order = {
  id: string;
  customer_name: string | null;
  status: OrderStatus;
  payment_method: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
};

// ✅ Never touches window — safe on server
const guestName = (n: string | null) => n?.trim() || "Guest";
const fmt = (d: string) =>
  new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const SELECT_QUERY = `
  id, customer_name, status, payment_method, total, created_at,
  order_items!order_items_order_id_fkey (
    id, menu_id, quantity, unit_price, notes,
    menus ( name )
  )
`;

export default function OwnerOrdersPage() {
  const router = useRouter(); // ✅ use Next.js router instead of window.location

  const [cafeId, setCafeId]             = useState<string | null>(null);
  const [orders, setOrders]             = useState<Order[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [updatingId, setUpdating]       = useState<string | null>(null);
  const [notifGranted, setNotifGranted] = useState(false);
  const [showNotifBar, setShowNotifBar] = useState(false);
  const knownIds                        = useRef<Set<string>>(new Set());

  // ── auth + cafe_id ────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        // ✅ router.push runs client-side only — safe
        if (!user) { router.push("/auth/signin"); return; }

        const { data: profile, error: pe } = await supabase
          .from("profiles")
          .select("cafe_id")
          .eq("id", user.id)
          .single();

        if (pe) throw pe;
        if (!profile?.cafe_id) { router.push("/auth/setup-cafe"); return; }
        setCafeId(profile.cafe_id);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load profile");
        setLoading(false);
      }
    })();
  }, [router]);

  // ── notification permission — runs only in browser after mount ────────────
  useEffect(() => {
    // typeof check is SSR-safe — no direct window access
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      setNotifGranted(true);
    } else if (Notification.permission === "default") {
      setShowNotifBar(true);
    }
  }, []);

  // ✅ requestNotif only ever called on a button click — always browser
  const requestNotif = () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    Notification.requestPermission().then((p) => {
      setNotifGranted(p === "granted");
      setShowNotifBar(false);
    });
  };

  const pushNotif = useCallback((order: Order) => {
    if (!notifGranted || typeof window === "undefined") return;
    new Notification("🆕 New Order!", {
      body: `${guestName(order.customer_name)} • $${order.total.toFixed(2)}`,
      icon: "/favicon.ico",
    });
  }, [notifGranted]);

  // ── initial fetch ─────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    if (!cafeId) return;
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(SELECT_QUERY)
        .eq("cafe_id", cafeId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const valid = ((data as unknown as Order[]) ?? []).filter(
        (o) => Array.isArray(o.order_items) && o.order_items.length > 0
      );
      valid.forEach((o) => knownIds.current.add(o.id));
      setOrders(valid);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error loading orders");
    } finally {
      setLoading(false);
    }
  }, [cafeId]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── real-time subscription ────────────────────────────────────────────────
  useEffect(() => {
    if (!cafeId) return;

    const channel = supabase
      .channel(`orders:${cafeId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `cafe_id=eq.${cafeId}` },
        async (payload) => {
          if (payload.eventType === "DELETE") {
            setOrders((prev) => prev.filter((o) => o.id !== (payload.old as { id: string }).id));
            return;
          }

          const newRecord = payload.new as { id: string };
          const { data, error } = await supabase
            .from("orders")
            .select(SELECT_QUERY)
            .eq("id", newRecord.id)
            .single();

          if (error || !data) return;
          const order = data as unknown as Order;
          if (!Array.isArray(order.order_items) || order.order_items.length === 0) return;

          if (payload.eventType === "INSERT" && !knownIds.current.has(order.id)) {
            knownIds.current.add(order.id);
            pushNotif(order);
          }

          setOrders((prev) => {
            const exists = prev.find((o) => o.id === order.id);
            if (exists) return prev.map((o) => (o.id === order.id ? order : o));
            return [order, ...prev];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [cafeId, pushNotif]);

  // ── status update ─────────────────────────────────────────────────────────
  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);
      if (error) throw error;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (e: unknown) {
      console.error("Status update failed:", e);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  // ── derived state ─────────────────────────────────────────────────────────
  const pending   = orders.filter((o) => o.status === "pending");
  const preparing = orders.filter((o) => o.status === "preparing");
  const completed = orders.filter((o) => o.status === "completed");
  const revenue   = completed.reduce((s, o) => s + o.total, 0);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

        .pos-root {
          font-family: 'DM Sans', sans-serif;
          color: #1A0F00;
          width: 100%;
          box-sizing: border-box;
        }

        *, *::before, *::after { box-sizing: border-box; }

        .pos-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .pos-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 2px;
        }

        .pos-sub {
          font-size: 11px;
          color: rgba(26,15,0,0.3);
          letter-spacing: 0.07em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .live-dot {
          width: 7px; height: 7px;
          background: #22c55e;
          border-radius: 50%;
          animation: livepulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes livepulse {
          0%,100% { opacity:1; box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50%      { opacity:0.7; box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }

        .kpi-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
          width: 100%;
        }

        @media (max-width: 600px) {
          .kpi-row { grid-template-columns: repeat(2, 1fr); }
        }

        .kpi {
          background: #ffffff;
          border: 1px solid rgba(200,135,58,0.2);
          border-radius: 14px;
          padding: 16px 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .kpi-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          line-height: 1;
          margin-bottom: 4px;
        }

        .kpi-lbl {
          font-size: 10px;
          color: rgba(26,15,0,0.3);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .new-alert {
          background: rgba(255,180,0,0.08);
          border: 1px solid rgba(255,180,0,0.35);
          border-radius: 12px;
          padding: 11px 16px;
          margin-bottom: 16px;
          font-size: 13px;
          color: #B87800;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .pulse-dot {
          width: 8px; height: 8px;
          background: #FFB400;
          border-radius: 50%;
          flex-shrink: 0;
          animation: pdot 1.2s ease-in-out infinite;
        }

        @keyframes pdot {
          0%,100% { transform:scale(1); opacity:1; }
          50%      { transform:scale(0.6); opacity:0.3; }
        }

        .err-bar {
          background: rgba(192,57,43,0.07);
          border: 1px solid rgba(192,57,43,0.2);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 16px;
          font-size: 13px;
          color: #c0392b;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .err-retry {
          font-size: 12px; font-weight: 500;
          color: #c0392b; background: none;
          border: 1px solid rgba(192,57,43,0.3);
          border-radius: 100px; padding: 4px 12px;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
        }

        .notif-bar {
          background: rgba(58,124,200,0.07);
          border: 1px solid rgba(58,124,200,0.2);
          border-radius: 12px;
          padding: 10px 16px;
          margin-bottom: 16px;
          font-size: 12px;
          color: #2A6CB8;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
        }

        .notif-btns { display: flex; gap: 8px; flex-shrink: 0; }

        .notif-allow {
          font-size: 12px; font-weight: 500;
          color: #2A6CB8; background: none;
          border: 1px solid rgba(58,124,200,0.3);
          border-radius: 100px; padding: 4px 12px;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
        }

        .notif-dismiss {
          font-size: 12px; color: rgba(26,15,0,0.3);
          background: none; border: none;
          padding: 4px 8px; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }

        .kanban {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          width: 100%;
          align-items: start;
        }

        @media (max-width: 860px) {
          .kanban { grid-template-columns: 1fr; }
        }

        .col-wrap {
          width: 100%;
          min-height: 300px;
          border-radius: 16px;
          padding: 16px;
        }

        .col-pending   { background: rgba(255,180,0,0.05);  border: 1px solid rgba(255,180,0,0.18); }
        .col-preparing { background: rgba(58,124,200,0.05); border: 1px solid rgba(58,124,200,0.18); }
        .col-done      { background: rgba(26,138,80,0.05);  border: 1px solid rgba(26,138,80,0.18); }

        .col-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(26,15,0,0.06);
        }

        .col-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .col-pending   .col-label { color: #B87800; }
        .col-preparing .col-label { color: #2A6CB8; }
        .col-done      .col-label { color: #1A8A50; }

        .col-count {
          font-size: 11px; font-weight: 700;
          width: 22px; height: 22px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }

        .col-pending   .col-count { background: rgba(255,180,0,0.15);  color: #B87800; }
        .col-preparing .col-count { background: rgba(58,124,200,0.15); color: #2A6CB8; }
        .col-done      .col-count { background: rgba(26,138,80,0.12);  color: #1A8A50; }

        .col-empty {
          text-align: center;
          padding: 32px 0;
          font-size: 12px;
          color: rgba(26,15,0,0.25);
        }

        .ocard {
          background: #ffffff;
          border-radius: 12px;
          margin-bottom: 10px;
          overflow: hidden;
          border: 1px solid rgba(200,135,58,0.12);
          box-shadow: 0 1px 6px rgba(0,0,0,0.05);
          transition: transform 0.15s, box-shadow 0.15s;
          width: 100%;
        }

        .ocard:hover { transform: translateY(-2px); box-shadow: 0 5px 16px rgba(0,0,0,0.09); }
        .ocard:last-child { margin-bottom: 0; }

        .ocard.pending   { border-top: 3px solid #FFB400; }
        .ocard.preparing { border-top: 3px solid #3A7CC8; }
        .ocard.completed { border-top: 3px solid #1A8A50; opacity: 0.75; }

        .ocard-top {
          padding: 12px 14px 8px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .ocard-name {
          font-size: 14px; font-weight: 500;
          color: #1A0F00; margin-bottom: 2px;
        }

        .ocard-name.guest { color: rgba(26,15,0,0.45); font-style: italic; }
        .ocard-time { font-size: 11px; color: rgba(26,15,0,0.3); }
        .ocard-right { text-align: right; flex-shrink: 0; }

        .ocard-total {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 600;
          color: #C8873A; line-height: 1;
        }

        .ocard-pay {
          font-size: 10px; color: rgba(26,15,0,0.3);
          text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px;
        }

        .ocard-items {
          padding: 0 14px 10px;
          display: flex; flex-direction: column; gap: 4px;
        }

        .item-row {
          display: flex; align-items: center; gap: 7px;
          font-size: 12px; color: #1A0F00;
          background: #F7F3EE; border-radius: 7px; padding: 5px 9px;
        }

        .item-qty {
          font-size: 10px; font-weight: 700; color: #C8873A;
          background: rgba(200,135,58,0.12); border-radius: 4px;
          padding: 1px 5px; flex-shrink: 0;
        }

        .item-note {
          font-size: 10px; color: rgba(26,15,0,0.4);
          margin-left: auto; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis; max-width: 80px;
        }

        .ocard-actions {
          padding: 8px 14px 12px;
          border-top: 1px solid rgba(26,15,0,0.06);
        }

        .btn {
          width: 100%; padding: 9px 0;
          border-radius: 100px; font-size: 12px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: all 0.15s; border: 1px solid;
          text-align: center; letter-spacing: 0.03em;
        }

        .btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-prepare {
          background: rgba(255,180,0,0.1); color: #B87800;
          border-color: rgba(255,180,0,0.4);
        }
        .btn-prepare:hover:not(:disabled) { background: rgba(255,180,0,0.2); }

        .btn-complete {
          background: #1A8A50; color: #ffffff;
          border-color: #1A8A50;
          box-shadow: 0 3px 8px rgba(26,138,80,0.25);
        }
        .btn-complete:hover:not(:disabled) { opacity: 0.88; }

        .btn-done {
          background: rgba(26,138,80,0.08); color: #1A8A50;
          border-color: rgba(26,138,80,0.2); cursor: default;
        }

        .status-msg {
          text-align: center; padding: 48px 0;
          font-size: 13px; color: rgba(26,15,0,0.25);
        }
      `}</style>

      <div className="pos-root">

        <div className="pos-header">
          <div>
            <h1 className="pos-title">Orders</h1>
            <p className="pos-sub">
              <span className="live-dot" />
              Live · updates instantly
            </p>
          </div>
        </div>

        {/* ✅ Controlled by state — never touches window on server */}
        {showNotifBar && (
          <div className="notif-bar">
            <span>Enable notifications to be alerted on new orders</span>
            <div className="notif-btns">
              <button className="notif-allow" onClick={requestNotif}>Allow</button>
              <button className="notif-dismiss" onClick={() => setShowNotifBar(false)}>✕</button>
            </div>
          </div>
        )}

        {error && (
          <div className="err-bar">
            <span>⚠ {error}</span>
            <button className="err-retry" onClick={fetchOrders}>Retry</button>
          </div>
        )}

        {!loading && (
          <div className="kpi-row">
            <div className="kpi">
              <p className="kpi-val" style={{ color: "#B87800" }}>{pending.length}</p>
              <p className="kpi-lbl">New</p>
            </div>
            <div className="kpi">
              <p className="kpi-val" style={{ color: "#3A7CC8" }}>{preparing.length}</p>
              <p className="kpi-lbl">Preparing</p>
            </div>
            <div className="kpi">
              <p className="kpi-val" style={{ color: "#1A8A50" }}>{completed.length}</p>
              <p className="kpi-lbl">Done</p>
            </div>
            <div className="kpi">
              <p className="kpi-val" style={{ color: "#C8873A" }}>${revenue.toFixed(2)}</p>
              <p className="kpi-lbl">Collected</p>
            </div>
          </div>
        )}

        {pending.length > 0 && (
          <div className="new-alert">
            <span className="pulse-dot" />
            {pending.length} new order{pending.length > 1 ? "s" : ""} waiting — tap Start Preparing
          </div>
        )}

        {loading && <p className="status-msg">Loading orders…</p>}

        {!loading && (
          <div className="kanban">

            <div className="col-wrap col-pending">
              <div className="col-head">
                <span className="col-label">New Orders</span>
                <span className="col-count">{pending.length}</span>
              </div>
              {pending.length === 0
                ? <p className="col-empty">No new orders</p>
                : pending.map((o) => (
                    <OrderCard key={o.id} order={o}
                      updating={updatingId === o.id}
                      onAction={() => updateStatus(o.id, "preparing")}
                      actionLabel="▶ Start Preparing"
                      actionClass="btn-prepare" />
                  ))
              }
            </div>

            <div className="col-wrap col-preparing">
              <div className="col-head">
                <span className="col-label">Preparing</span>
                <span className="col-count">{preparing.length}</span>
              </div>
              {preparing.length === 0
                ? <p className="col-empty">Nothing in progress</p>
                : preparing.map((o) => (
                    <OrderCard key={o.id} order={o}
                      updating={updatingId === o.id}
                      onAction={() => updateStatus(o.id, "completed")}
                      actionLabel="✓ Mark Complete"
                      actionClass="btn-complete" />
                  ))
              }
            </div>

            <div className="col-wrap col-done">
              <div className="col-head">
                <span className="col-label">Completed</span>
                <span className="col-count">{completed.length}</span>
              </div>
              {completed.length === 0
                ? <p className="col-empty">No completed orders yet</p>
                : completed.map((o) => (
                    <OrderCard key={o.id} order={o}
                      updating={false}
                      onAction={() => {}}
                      actionLabel="✓ Completed & Paid"
                      actionClass="btn-done"
                      isDone />
                  ))
              }
            </div>

          </div>
        )}
      </div>
    </>
  );
}

function OrderCard({
  order, updating, onAction, actionLabel, actionClass, isDone = false,
}: {
  order: Order;
  updating: boolean;
  onAction: () => void;
  actionLabel: string;
  actionClass: string;
  isDone?: boolean;
}) {
  const isGuest = !order.customer_name?.trim();
  return (
    <div className={`ocard ${order.status}`}>
      <div className="ocard-top">
        <div>
          <p className={`ocard-name ${isGuest ? "guest" : ""}`}>
            {guestName(order.customer_name)}
          </p>
          <p className="ocard-time">{fmt(order.created_at)}</p>
        </div>
        <div className="ocard-right">
          <p className="ocard-total">${order.total.toFixed(2)}</p>
          <p className="ocard-pay">{order.payment_method}</p>
        </div>
      </div>

      <div className="ocard-items">
        {order.order_items.map((item) => (
          <div key={item.id} className="item-row">
            <span className="item-qty">×{item.quantity}</span>
            <span>{item.menus?.name || "Unknown item"}</span>
            {item.notes && <span className="item-note">{item.notes}</span>}
          </div>
        ))}
      </div>

      <div className="ocard-actions">
        <button
          className={`btn ${actionClass}`}
          disabled={updating || isDone}
          onClick={onAction}
        >
          {updating ? "Updating…" : actionLabel}
        </button>
      </div>
    </div>
  );
}