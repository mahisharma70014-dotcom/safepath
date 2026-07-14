"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { StatusPill } from "@/components/ui/status-pill";
import { usePollingJson } from "@/hooks/use-polling-json";
import type { RequestRecord } from "@/lib/data-model";

export default function OrderHistoryPage() {
  const { data } = usePollingJson<{ requests: RequestRecord[] }>("/api/requests?scope=mine", 2500);
  const orders = (data?.requests ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Order History</h2>
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
