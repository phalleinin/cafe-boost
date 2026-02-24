"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OwnerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cafeName, setCafeName] = useState<string | null>(null);

  useEffect(() => {
    const loadOwnerData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 🔐 Not logged in
      if (!user) {
        router.push("/");
        return;
      }

      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // ❌ No profile
      if (!profile) {
        router.push("/");
        return;
      }

      // ❌ Not an owner
      if (profile.role !== "owner") {
        router.push("/barista/dashboard");
        return;
      }

      // Get cafe
      const { data: cafe } = await supabase
        .from("cafes")
        .select("*")
        .eq("id", profile.cafe_id)
        .single();

      if (cafe) {
        setCafeName(cafe.name);
      }

      setLoading(false);
    };

    loadOwnerData();
  }, [router]);

  if (loading) {
    return <p className="p-10">Loading dashboard...</p>;
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <section className="max-w-6xl mx-auto px-6 py-16">
        
        {/* Header */}
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          {cafeName ? `${cafeName} Dashboard` : "Owner Dashboard"}
        </h1>

        <p className="text-lg text-gray-600 mb-10">
          Manage your café, track sales, and view analytics.
        </p>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Menu Management */}
          <DashboardCard
            icon="📋"
            title="Menu Management"
            desc="Add, edit, or remove menu items and update stock."
            href="/owner/menu"
            button="Manage Menu"
          />

          {/* Orders */}
          <DashboardCard
            icon="🧾"
            title="Orders & Payments"
            desc="Monitor orders, track payments, and manage refunds."
            href="/owner/orders"
            button="View Orders"
          />

          {/* Analytics */}
          <DashboardCard
            icon="📊"
            title="Analytics"
            desc="Track page views, popular items, and peak hours."
            href="/owner/analytics"
            button="View Analytics"
          />

          {/* AI Insights */}
          <DashboardCard
            icon="🤖"
            title="AI Insights"
            desc="Get recommendations and guided search for your café."
            href="/owner/insights"
            button="Explore Insights"
          />

          {/* Barista Management */}
          <DashboardCard
            icon="👩‍🍳"
            title="Barista Management"
            desc="Control access, assign roles, and monitor barista activity."
            href="/owner/baristas"
            button="Manage Baristas"
          />

        </div>
      </section>
    </main>
  );
}

function DashboardCard({
  icon,
  title,
  desc,
  href,
  button,
}: {
  icon: string;
  title: string;
  desc: string;
  href: string;
  button: string;
}) {
  return (
    <div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600 mb-6">{desc}</p>
      <Link
        href={href}
        className="inline-block bg-linear-to-r from-amber-600 to-amber-800 text-white px-5 py-2 rounded-full font-medium hover:opacity-90 transition"
      >
        {button}
      </Link>
    </div>
  );
}