"use client";

import { useState } from "react";

type Order = {
  id: string;
  customer: string;
  items: string;
  total: number;
  paymentStatus: "Paid" | "Unpaid" | "Refunded";
  orderStatus: "Pending" | "Preparing" | "Completed";
  method: "Cash" | "Card" | "Online";
};

export default function OrdersPaymentsPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([
    { id: "001", customer: "Alex Reed", items: "Iced Latte x2", total: 12.0, paymentStatus: "Paid", orderStatus: "Completed", method: "Card" },
    { id: "002", customer: "Sarah Jen", items: "Muffin x1, Espresso x1", total: 7.5, paymentStatus: "Unpaid", orderStatus: "Pending", method: "Cash" },
    { id: "003", customer: "Mike Ross", items: "Flat White x1", total: 4.5, paymentStatus: "Paid", orderStatus: "Preparing", method: "Online" },
  ]);

  const updateStatus = (id: string, status: Order["paymentStatus"]) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentStatus: status } : o));
  };

  const deleteOrder = (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Order ID,Customer,Items,Total,Status,Method\n" + 
      orders.map(o => `${o.id},${o.customer},"${o.items}",${o.total},${o.paymentStatus},${o.method}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cafe_orders.csv");
    document.body.appendChild(link);
    link.click();
  };

  const filteredOrders = orders
    .filter(o => filter === "All" || o.paymentStatus === filter)
    .filter(o => 
      o.customer.toLowerCase().includes(search.toLowerCase()) || 
      o.id.toLowerCase().includes(search.toLowerCase())
    );

  const totalRevenue = orders.filter(o => o.paymentStatus === "Paid").reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8 text-gray-800">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Orders & Payments</h1>
            <p className="text-gray-500 text-sm">Monitor daily sales and manage customer transactions.</p>
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={exportData}
              className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition"
            >
              📥 Export CSV
            </button>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-right">
              <p className="text-xs font-bold text-gray-400 uppercase">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input 
            type="text"
            placeholder="Search Order ID or Customer..."
            className="px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#D46B13] flex-1"
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            {["All", "Paid", "Unpaid", "Refunded"].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === f ? "bg-black text-white" : "bg-white text-gray-500 border border-gray-200"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="flex-1 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{order.id}</span>
                  <h3 className="font-bold text-lg">{order.customer}</h3>
                </div>
                {/* Fixed item alignment: whitespace-pre-wrap ensures commas or multiple lines look clean */}
                <p className="text-gray-500 text-sm whitespace-pre-wrap max-w-xs">{order.items}</p>
                <div className="mt-2 flex gap-3 text-xs font-bold uppercase tracking-wider">
                  <span className="text-gray-400">Via {order.method}</span>
                  <span className={order.orderStatus === "Completed" ? "text-green-500" : "text-orange-500"}>• {order.orderStatus}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase">Amount</p>
                  <p className="text-xl font-bold">${order.total.toFixed(2)}</p>
                </div>

                <div className="flex gap-2">
                  {order.paymentStatus === "Unpaid" && (
                    <button 
                      onClick={() => updateStatus(order.id, "Paid")}
                      className="bg-[#D46B13] hover:bg-[#b05910] text-white px-5 py-2 rounded-full font-bold text-sm transition shadow-sm"
                    >
                      Collect
                    </button>
                  )}
                  {order.paymentStatus === "Paid" && (
                    <button 
                      onClick={() => updateStatus(order.id, "Refunded")}
                      className="border border-red-200 text-red-500 hover:bg-red-50 px-5 py-2 rounded-full font-bold text-sm transition"
                    >
                      Refund
                    </button>
                  )}
                  {order.paymentStatus === "Refunded" && (
                    <button 
                      onClick={() => updateStatus(order.id, "Paid")}
                      className="bg-gray-800 text-white hover:bg-black px-5 py-2 rounded-full font-bold text-sm transition"
                    >
                      Undo
                    </button>
                  )}
                  <button 
                    onClick={() => deleteOrder(order.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition"
                    title="Delete Order"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-[2.5rem] max-w-sm w-full relative shadow-2xl">
              <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 font-bold">✕</button>
              <h2 className="text-center font-black text-xl mb-2 uppercase tracking-widest">CafeBoost</h2>
              <p className="text-center text-xs text-gray-400 mb-6 font-bold uppercase">Order Receipt</p>
              
              <div className="border-t border-dashed border-gray-200 py-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Customer</span>
                  <span className="font-bold">{selectedOrder.customer}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 shrink-0">Items</span>
                  <span className="font-bold text-right ml-4 whitespace-pre-wrap">{selectedOrder.items}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Method</span>
                  <span className="font-bold">{selectedOrder.method}</span>
                </div>
              </div>

              <div className="border-t border-black pt-4 mt-2 flex justify-between items-center">
                <span className="font-black text-lg">TOTAL</span>
                <span className="font-black text-2xl">${selectedOrder.total.toFixed(2)}</span>
              </div>
              
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="w-full mt-8 bg-[#D46B13] hover:bg-[#b05910] text-white py-3 rounded-2xl font-bold transition shadow-lg"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}