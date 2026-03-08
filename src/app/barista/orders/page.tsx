"use client";

import { useState } from "react";
import Link from "next/link";

type Order = {
  id: number;
  customer: string;
  items: string[];
  status: "Pending" | "Preparing" | "Ready";
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      customer: "Alice",
      items: ["Latte", "Croissant"],
      status: "Pending",
    },
    {
      id: 2,
      customer: "Ben",
      items: ["Cappuccino"],
      status: "Preparing",
    },
    {
      id: 3,
      customer: "Charlie",
      items: ["Matcha Latte", "Muffin"],
      status: "Ready",
    },
  ]);

  const updateStatus = (id: number, newStatus: Order["status"]) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Orders Queue</h1>

          <Link
            href="/barista"
            className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-2xl shadow-md"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Order #{order.id}
                  </h2>
                  <p className="text-gray-600">
                    Customer: {order.customer}
                  </p>
                </div>

                <span
                  className={`px-4 py-1 rounded-full text-sm font-medium ${
                    order.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : order.status === "Preparing"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <ul className="list-disc ml-6 mb-4 text-gray-700">
                {order.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <div className="flex gap-3">
                <button
                  onClick={() => updateStatus(order.id, "Pending")}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
                >
                  Pending
                </button>

                <button
                  onClick={() => updateStatus(order.id, "Preparing")}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
                >
                  Preparing
                </button>

                <button
                  onClick={() => updateStatus(order.id, "Ready")}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
                >
                  Ready
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
