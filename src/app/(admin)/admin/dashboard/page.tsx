"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { usePollingJson } from "@/hooks/use-polling-json";

type AdminSummaryResponse = {
  metrics: {
    totalUsers: number;
    verifiedUsers: number;
    pendingKyc: number;
    revenue30d: number;
    depositRequests: number;
    withdrawalRequests: number;
    completedTransactions: number;
    totalWalletBalance: number;
  };
  recentRequests: Array<{
    id: string;
    type: string;
    status: string;
    amountUsdt: number;
    userEmail: string;
    createdAt: string;
  }>;
};

export default function AdminDashboardPage() {
  const { data } = usePollingJson<AdminSummaryResponse>("/api/admin/summary", 3000);
  const metrics = data?.metrics ?? {
    totalUsers: 0,
    verifiedUsers: 0,
    pendingKyc: 0,
    revenue30d: 0,
    depositRequests: 0,
    withdrawalRequests: 0,
    completedTransactions: 0,
    totalWalletBalance: 0,
  };
  const recentRequests = data?.recentRequests ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard Analytics</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PanelCard title="Total Users">
          <p className="text-2xl font-semibold text-slate-100">{metrics.totalUsers.toLocaleString("en-IN")}</p>
          <p className="mt-2 text-sm text-cyan-300">Live registered accounts</p>
        </PanelCard>
        <PanelCard title="Wallet Balance">
          <p className="text-2xl font-semibold text-slate-100">USDT {metrics.totalWalletBalance.toLocaleString("en-IN")}</p>
          <p className="mt-2 text-sm text-cyan-300">Live wallet balance across users</p>
        </PanelCard>
        <PanelCard title="Deposit Requests">
          <p className="text-2xl font-semibold text-slate-100">{metrics.depositRequests.toLocaleString("en-IN")}</p>
          <p className="mt-2 text-sm text-cyan-300">Pending + completed deposits</p>
        </PanelCard>
        <PanelCard title="Withdrawal Requests">
          <p className="text-2xl font-semibold text-slate-100">{metrics.withdrawalRequests.toLocaleString("en-IN")}</p>
          <p className="mt-2 text-sm text-cyan-300">Withdrawal activity count</p>
        </PanelCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PanelCard title="Verified Users">
          <p className="text-2xl font-semibold text-slate-100">{metrics.verifiedUsers.toLocaleString("en-IN")}</p>
          <p className="mt-2 text-sm text-cyan-300">Users with active role</p>
        </PanelCard>
        <PanelCard title="Pending KYC">
          <p className="text-2xl font-semibold text-slate-100">{metrics.pendingKyc.toLocaleString("en-IN")}</p>
          <p className="mt-2 text-sm text-cyan-300">Awaiting KYC decision</p>
        </PanelCard>
        <PanelCard title="Completed Transactions">
          <p className="text-2xl font-semibold text-slate-100">{metrics.completedTransactions.toLocaleString("en-IN")}</p>
          <p className="mt-2 text-sm text-cyan-300">Completed sell orders</p>
        </PanelCard>
        <PanelCard title="Revenue (30d)">
          <p className="text-2xl font-semibold text-slate-100">INR {metrics.revenue30d.toLocaleString("en-IN")}</p>
          <p className="mt-2 text-sm text-cyan-300">Completed sell settlements</p>
        </PanelCard>
      </div>

      <PanelCard title="Recent Requests" subtitle="Latest activity across seller operations">
        <div className="overflow-x-auto rounded-xl border border-cyan-800/30">
          <table className="min-w-full text-sm">
            <thead className="bg-[#071830] text-left text-slate-300">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">USDT</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.length ? (
                recentRequests.map((item) => (
                  <tr key={item.id} className="border-t border-cyan-900/20 text-slate-200">
                    <td className="px-4 py-3">{item.userEmail || "-"}</td>
                    <td className="px-4 py-3 uppercase">{item.type}</td>
                    <td className="px-4 py-3">{item.amountUsdt}</td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="px-4 py-3">{item.createdAt}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-cyan-900/20 text-slate-400">
                  <td className="px-4 py-3" colSpan={5}>
                    No requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </div>
  );
}
