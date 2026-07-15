"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { usePollingJson } from "@/hooks/use-polling-json";
import type { RequestRecord } from "@/lib/data-model";
import Link from "next/link";

export default function SellerDashboardPage() {
  const { data: walletData } = usePollingJson<{
    wallet: {
      availableUsdt: number;
      lockedUsdt: number;
      lastSettlementInr: number;
      lastDepositUsdt: number;
    };
  }>("/api/wallet", 3000);

  const { data: requestsData } = usePollingJson<{ requests: RequestRecord[] }>("/api/requests?scope=mine", 3000);

  const wallet =
    walletData?.wallet ??
    ({ availableUsdt: 0, lockedUsdt: 0, lastSettlementInr: 0, lastDepositUsdt: 0 } as const);
  const requests = requestsData?.requests ?? [];

  const today = new Date().toLocaleDateString("en-IN");
  const soldTodayUsdt = requests
    .filter((request) => request.type === "sell" && request.status === "Completed")
    .filter((request) => {
      const created = new Date(request.createdAt);
      return !Number.isNaN(created.getTime()) && created.toLocaleDateString("en-IN") === today;
    })
    .reduce((sum, request) => sum + request.amountUsdt, 0);

  const activeOrders = requests.filter(
    (request) => request.status === "Pending" || request.status === "Processing",
  ).length;

  const pendingPayoutInr = requests
    .filter(
      (request) =>
        request.type === "sell" &&
        (request.status === "Pending" || request.status === "Processing") &&
        typeof request.estimatedInr === "number",
    )
    .reduce((sum, request) => sum + (request.estimatedInr ?? 0), 0);

  const pendingDepositCount = requests.filter((request) => request.type === 'deposit' && request.status === 'Pending').length;
  const recentTransactions = requests.slice(0, 5);
  const recentDepositRequests = requests.filter((request) => request.type === 'deposit').slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard Overview</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/seller/deposit-usdt" className="glass-card rounded-2xl p-5 transition hover:translate-y-[-2px]">
          <p className="text-xs uppercase tracking-wide text-cyan-300/90">Card 1</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-50">Deposit USDT</h3>
          <p className="mt-2 text-sm text-slate-400">View admin-configured deposit wallet and transfer safely.</p>
        </Link>

        <Link href="/seller/sell-usdt" className="glass-card rounded-2xl p-5 transition hover:translate-y-[-2px]">
          <p className="text-xs uppercase tracking-wide text-cyan-300/90">Card 2</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-50">Sell USDT</h3>
          <p className="mt-2 text-sm text-slate-400">Create sell requests, track statuses, and view history.</p>
        </Link>

        <Link href="/seller/withdraw-usdt" className="glass-card rounded-2xl p-5 transition hover:translate-y-[-2px]">
          <p className="text-xs uppercase tracking-wide text-cyan-300/90">Card 3</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-50">Withdraw USDT</h3>
          <p className="mt-2 text-sm text-slate-400">Submit withdrawal requests with network-wise validation.</p>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <PanelCard title="Wallet Balance">
          <p className="text-2xl font-semibold text-slate-100">
            {wallet.availableUsdt.toLocaleString("en-IN", { maximumFractionDigits: 2 })} USDT
          </p>
          <p className="mt-2 text-sm text-cyan-300">Available live balance</p>
        </PanelCard>
        <PanelCard title="USDT Sold Today">
          <p className="text-2xl font-semibold text-slate-100">
            {soldTodayUsdt.toLocaleString("en-IN", { maximumFractionDigits: 2 })} USDT
          </p>
          <p className="mt-2 text-sm text-cyan-300">Completed sell orders today</p>
        </PanelCard>
        <PanelCard title="Active Orders">
          <p className="text-2xl font-semibold text-slate-100">{activeOrders}</p>
          <p className="mt-2 text-sm text-cyan-300">Pending + processing requests</p>
        </PanelCard>
        <PanelCard title="Pending Payout">
          <p className="text-2xl font-semibold text-slate-100">
            INR {pendingPayoutInr.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </p>
          <p className="mt-2 text-sm text-cyan-300">Sell requests awaiting completion</p>
        </PanelCard>
        <PanelCard title="Pending Deposits">
          <p className="text-2xl font-semibold text-slate-100">{pendingDepositCount}</p>
          <p className="mt-2 text-sm text-cyan-300">Deposit requests awaiting approval</p>
        </PanelCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <PanelCard title="Recent Transactions" subtitle="Latest activity from your live account">
          <div className="overflow-x-auto rounded-xl border border-cyan-800/30">
            <table className="min-w-full text-sm">
              <thead className="bg-[#071830] text-left text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length ? (
                  recentTransactions.map((request) => (
                    <tr key={request.id} className="border-t border-cyan-900/20 text-slate-200">
                      <td className="px-4 py-3 uppercase">{request.type}</td>
                      <td className="px-4 py-3">{request.amountUsdt}</td>
                      <td className="px-4 py-3">{request.status}</td>
                      <td className="px-4 py-3">{request.createdAt}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-cyan-900/20 text-slate-400">
                    <td className="px-4 py-3" colSpan={4}>
                      No activity yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </PanelCard>

        <PanelCard title="Recent Deposit Requests" subtitle="Your latest deposit submissions">
          <div className="overflow-x-auto rounded-xl border border-cyan-800/30">
            <table className="min-w-full text-sm">
              <thead className="bg-[#071830] text-left text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Network</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentDepositRequests.length ? (
                  recentDepositRequests.map((request) => (
                    <tr key={request.id} className="border-t border-cyan-900/20 text-slate-200">
                      <td className="px-4 py-3">{request.amountUsdt} USDT</td>
                      <td className="px-4 py-3">{request.network}</td>
                      <td className="px-4 py-3">{request.status}</td>
                      <td className="px-4 py-3">{request.createdAt}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-cyan-900/20 text-slate-400">
                    <td className="px-4 py-3" colSpan={4}>
                      No deposit requests yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </PanelCard>
      </div>
    </div>
  );
}
