"use client";

import { useState } from "react";

type Order = {
  id: string;
  customer: string;
  items: string;
  total: number;
  paymentStatus: "Paid" | "Unpaid";
  orderStatus: "Pending" | "Preparing" | "Completed";
  date: string;
};

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD001",
      customer: "John",
      items: "Latte x2, Croissant x1",
      total: 8.5,
      paymentStatus: "Unpaid",
      orderStatus: "Pending",
      date: "2026-02-25",
    },
    {
      id: "ORD002",
      customer: "Lisa",
      items: "Americano x1",
      total: 3.0,
      paymentStatus: "Paid",
      orderStatus: "Completed",
      date: "2026-02-25",
    },
  ]);

  const markAsPaid = (id: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, paymentStatus: "Paid" } : order
      )
    );
  };

  const totalRevenue = orders
    .filter((order) => order.paymentStatus === "Paid")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Owner Dashboard - Orders</h1>

      {/* Revenue Summary */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold">Total Revenue</h2>
        <p className="text-xl font-bold">${totalRevenue.toFixed(2)}</p>
      </div>

      {/* Orders Table */}
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Order ID</th>
            <th className="border p-2">Customer</th>
            <th className="border p-2">Items</th>
            <th className="border p-2">Total</th>
            <th className="border p-2">Payment</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="border p-2">{order.id}</td>
              <td className="border p-2">{order.customer}</td>
              <td className="border p-2">{order.items}</td>
              <td className="border p-2">${order.total}</td>
              <td className="border p-2">{order.paymentStatus}</td>
              <td className="border p-2">{order.orderStatus}</td>
              <td className="border p-2">
                {order.paymentStatus === "Unpaid" && (
                  <button
                    onClick={() => markAsPaid(order.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Mark as Paid
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}