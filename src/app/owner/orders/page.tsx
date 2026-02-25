"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type OrderItem = {
  id: string;
  menu_id: string;
  quantity: number;
  unit_price: number;
  notes: string | null;
  menus: {
    name: string;
  } | null;  // ✅ Supabase returns joined relation as object or null
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ✅ Step 1 — Get cafe_id from session
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = "/owner/login";
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("cafe_id")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        if (!profile?.cafe_id) {
          window.location.href = "/owner/setup-cafe";
          return;
        }

        setCafeId(profile.cafe_id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
        setLoading(false);
      }
    };

    init();
  }, []);

  // ✅ Step 2 — Fetch orders with their items once cafeId is available
  useEffect(() => {
    if (!cafeId) return;

    let cancelled = false;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("orders")
          .select(`
            id,
            customer_name,
            status,
            payment_method,
            total,
            created_at,
            order_items (
              id,
              menu_id,
              quantity,
              unit_price,
              notes,
              menus (
                name
              )
            )
          `)
          .eq("cafe_id", cafeId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!cancelled) setOrders((data as unknown as Order[]) || []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error loading orders");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrders();
    return () => { cancelled = true; };
  }, [cafeId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "preparing": return "bg-blue-100 text-blue-700";
      case "completed": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <section className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <h1 className="text-4xl font-bold tracking-tight mb-2">Orders</h1>
        <p className="text-gray-500 mb-8">View all orders placed at your café.</p>

        {/* Loading / Error */}
        {loading && <p className="text-gray-500">Loading orders…</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Empty state */}
        {!loading && !error && orders.length === 0 && (
          <p className="text-gray-500">No orders yet.</p>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
              >
                {/* Order Summary Row */}
                <div
                  className="flex flex-wrap items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() =>
                    setExpandedId(expandedId === order.id ? null : order.id)
                  }
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-lg">
                      {order.customer_name}
                    </span>
                    <span className="text-sm text-gray-400">
                      {formatDate(order.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm text-gray-500 capitalize">
                      {order.payment_method}
                    </span>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                    <span className="font-bold text-amber-700">
                      ${order.total.toFixed(2)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {expandedId === order.id ? "▲ Hide" : "▼ Details"}
                    </span>
                  </div>
                </div>

                {/* Order Items — expanded */}
                {expandedId === order.id && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">
                      Order Items
                    </h3>
                    <div className="space-y-2">
                      {order.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-sm"
                        >
                          <div>
                            <span className="font-medium">
                              {item.menus?.name || "Unknown item"}
                            </span>
                            {item.notes && (
                              <span className="text-gray-400 ml-2">
                                — {item.notes}
                              </span>
                            )}
                          </div>
                          <div className="text-gray-600">
                            x{item.quantity} · ${(item.unit_price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </section>
    </main>
  );
}