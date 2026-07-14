"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { StatusPill } from "@/components/ui/status-pill";
import { usePollingJson } from "@/hooks/use-polling-json";
import type { RequestRecord, TransactionStatus } from "@/lib/data-model";

export default function AdminApprovalsPage() {
  const { data, refresh } = usePollingJson<{ requests: RequestRecord[] }>("/api/requests?scope=all", 2500);
  const requests = data?.requests ?? [];

  const updateStatus = async (id: string, status: TransactionStatus) => {
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    await refresh();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Manual Order Approval</h2>
      <PanelCard title="Approval Queue">
        <div className="space-y-3">
          {requests.length === 0 ? (
            <p className="text-slate-300">No requests available.</p>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="rounded-xl border border-cyan-900/30 bg-cyan-500/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-100">{request.id} - {request.type.toUpperCase()}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {request.userEmail} | {request.amountUsdt} USDT | {request.network} | {request.createdAt}
                    </p>
                    {request.type === "deposit" || request.type === "withdraw" ? (
                      <p className="mt-1 text-sm text-slate-400">
                        Screenshot: {request.screenshotName || "Not provided"}
                      </p>
                    ) : null}
                  </div>
                  <StatusPill status={request.status} />
                </div>
                {(request.type === "deposit" || request.type === "withdraw") && request.screenshotDataUrl ? (
                  <div className="mt-3 rounded-lg border border-cyan-800/30 bg-[#071830]/60 p-2">
                    <img
                      src={request.screenshotDataUrl}
                      alt={`Deposit proof ${request.id}`}
                      className="max-h-48 rounded-md object-contain"
                    />
                  </div>
                ) : null}
                {request.status === "Completed" || request.status === "Rejected" ? (
                  <p className="mt-3 text-sm text-slate-400">Finalized request. No further action available.</p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="btn-ghost px-3 py-2 text-sm" onClick={() => void updateStatus(request.id, "Processing") }>
                      Mark Processing
                    </button>
                    <button className="btn-primary px-3 py-2 text-sm" onClick={() => void updateStatus(request.id, "Completed") }>
                      Approve / Complete
                    </button>
                    <button className="btn-ghost px-3 py-2 text-sm" onClick={() => void updateStatus(request.id, "Rejected") }>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </PanelCard>
    </div>
  );
}
