"use client";

import { useState } from "react";

type Order = {
  id: string;
  customer: string;
  items: string;
  total: number;
  paymentStatus: "Verified" | "Pending Verification" | "Refunded";
  orderStatus: "Pending" | "Preparing" | "Completed";
  method: "Cash" | "Card" | "Online";
};

export default function PaymentStatusPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const [orders, setOrders] = useState<Order[]>([
    { id: "001", customer: "Alex Reed", items: "Iced Latte x2", total: 12.0, paymentStatus: "Verified", orderStatus: "Completed", method: "Card" },
    { id: "002", customer: "Sarah Jen", items: "Muffin x1\nEspresso x1", total: 7.5, paymentStatus: "Pending Verification", orderStatus: "Pending", method: "Cash" },
    { id: "003", customer: "Mike Ross", items: "Flat White x1", total: 4.5, paymentStatus: "Verified", orderStatus: "Preparing", method: "Online" },
  ]);

  const updateStatus = (id: string, status: Order["paymentStatus"]) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentStatus: status } : o));
  };

  const deleteOrder = (id: string) => {
    if (confirm("Delete this payment record?")) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  const filteredOrders = orders
    .filter(o => filter === "All" || o.paymentStatus === filter)
    .filter(o => o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search));

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8 text-gray-800">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Payment Status</h1>
          <p className="text-gray-500 text-sm">Verify sandbox payments before preparing drinks.</p>
        </header>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input 
            type="text"
            placeholder="Search customer or ID..."
            className="px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#D46B13] flex-1"
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2 bg-gray-100 p-1 rounded-full">
            {["All", "Verified", "Pending Verification"].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${filter === f ? "bg-white shadow-sm text-black" : "text-gray-500"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Cards */}
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="flex-1 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{order.id}</span>
                  <h3 className="font-bold text-lg">{order.customer}</h3>
                </div>
                <p className="text-gray-500 text-sm whitespace-pre-line leading-relaxed">{order.items}</p>
                <div className="mt-2 flex gap-3 text-xs font-bold uppercase tracking-wider">
                  <span className="text-gray-400">Method: {order.method}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Amount</p>
                  <p className="text-xl font-black">${order.total.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-3">
                  {order.paymentStatus === "Pending Verification" ? (
                    <button 
                      onClick={() => updateStatus(order.id, "Verified")}
                      className="bg-[#D46B13] hover:bg-[#b05910] text-white px-6 py-2 rounded-full font-bold text-sm transition"
                    >
                      Verify Payment
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-full border border-green-100">
                        ✓ Verified
                      </span>
                      <button 
                        onClick={() => updateStatus(order.id, "Pending Verification")}
                        className="text-xs text-gray-400 hover:text-gray-600 underline font-medium px-2"
                      >
                        Undo
                      </button>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => deleteOrder(order.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Modal / Receipt */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-[2.5rem] max-w-sm w-full relative shadow-2xl">
              <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 text-gray-400 font-bold">✕</button>
              <h2 className="text-center font-black text-xl mb-6 uppercase tracking-widest border-b pb-4">Payment Info</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm font-bold uppercase">Customer</span>
                  <span className="font-bold">{selectedOrder.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm font-bold uppercase shrink-0">Items</span>
                  <span className="font-bold text-right whitespace-pre-line ml-4">{selectedOrder.items}</span>
                </div>
                <div className="flex justify-between border-t border-dashed pt-4">
                  <span className="font-black text-lg tracking-tighter">TOTAL PAID</span>
                  <span className="font-black text-xl text-[#D46B13]">${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                   className="w-full border border-gray-200 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-50 transition"
                   onClick={() => {
                     alert("Printing Receipt Proof...");
                     setSelectedOrder(null);
                   }}
                >
                  Print Proof
                </button>
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="w-full bg-black text-white py-3 rounded-2xl font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}