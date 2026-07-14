"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { StatusPill } from "@/components/ui/status-pill";
import { getSession } from "@/lib/auth";
import { getUserRequests, SystemRequest } from "@/lib/system-data";
import { useEffect, useState } from "react";

export default function ActiveOrdersPage() {
  const [orders, setOrders] = useState<SystemRequest[]>([]);

  useEffect(() => {
    const session = getSession();
    const email = session?.email ?? "seller@company.com";
    setOrders(getUserRequests(email).filter((order) => order.status === "Pending" || order.status === "Processing"));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Active Orders</h2>
      <PanelCard title="Search & Filters" subtitle="Track pending and processing sell requests">
        <div className="grid gap-3 md:grid-cols-3">
          <input className="input-base" placeholder="Search by order id" />
          <select className="input-base">
            <option>All Networks</option>
            <option>TRC20</option>
            <option>BEP20</option>
            <option>ERC20</option>
          </select>
          <select className="input-base">
            <option>All Status</option>
            <option>Pending</option>
            <option>Processing</option>
          </select>
        </div>
      </PanelCard>

      <PanelCard>
        <div className="overflow-x-auto rounded-xl border border-cyan-800/30">
          <table className="min-w-full text-sm">
            <thead className="bg-[#071830] text-left text-slate-300">
              <tr>
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">USDT</th>
                <th className="px-4 py-3 font-medium">Network</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created At</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                  <tr key={order.id} className="border-t border-cyan-900/20 text-slate-200">
                    <td className="px-4 py-3">{order.id}</td>
                    <td className="px-4 py-3 uppercase">{order.type}</td>
                    <td className="px-4 py-3">{order.amountUsdt}</td>
                    <td className="px-4 py-3">{order.network}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={order.status} />
                    </td>
                    <td className="px-4 py-3">{order.createdAt}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </div>
  );
}
