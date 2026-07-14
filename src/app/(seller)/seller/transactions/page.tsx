"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { StatusPill } from "@/components/ui/status-pill";
import { usePollingJson } from "@/hooks/use-polling-json";
import type { RequestRecord } from "@/lib/data-model";

export default function TransactionsPage() {
  const { data } = usePollingJson<{ requests: RequestRecord[] }>("/api/requests?scope=mine", 2500);
  const transactions = data?.requests ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Transaction History</h2>
      <PanelCard>
        <ul className="space-y-3">
          {transactions.map((tx) => (
            <li key={tx.id} className="rounded-xl border border-cyan-900/30 bg-cyan-500/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-100">{tx.id} - {tx.type.toUpperCase()}</p>
                <p className="text-cyan-200">{tx.amountUsdt} USDT</p>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-400">
                <p>{tx.createdAt}</p>
                <StatusPill status={tx.status} />
              </div>
            </li>
          ))}
        </ul>
      </PanelCard>
    </div>
  );
}
