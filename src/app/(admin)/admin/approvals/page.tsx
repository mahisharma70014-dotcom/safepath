"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { StatusPill } from "@/components/ui/status-pill";
import { Toast } from "@/components/ui/toast";
import { usePollingJson } from "@/hooks/use-polling-json";
import type { RequestRecord, TransactionStatus } from "@/lib/data-model";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type ToastState = { type: "success" | "error" | "info"; message: string };

export default function AdminApprovalsPage() {
  const { data, refresh } = usePollingJson<{ requests: RequestRecord[] }>('/api/requests?scope=all', 2500);
  const requests = data?.requests ?? [];
  const depositRequests = requests.filter((request) => request.type === 'deposit');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const updateStatus = async (request: RequestRecord, status: Extract<TransactionStatus, 'Approved' | 'Rejected'>) => {
    const confirmed = window.confirm(status === 'Approved' ? 'Approve this deposit request?' : 'Reject this deposit request?');
    if (!confirmed) {
      return;
    }

    let rejectionReason = '';
    if (status === 'Rejected') {
      rejectionReason = window.prompt('Optional rejection reason', '') ?? '';
    }

    setBusyId(request.id);
    try {
      const response = await fetch(`/api/requests/${request.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, adminNote: rejectionReason || undefined, rejectionReason: rejectionReason || undefined }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to update deposit request.');
      }

      setToast({ type: 'success', message: status === 'Approved' ? 'Deposit approved successfully.' : 'Deposit rejected successfully.' });
      await refresh();
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Unable to update deposit request.' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Deposit Requests</h2>
      <PanelCard title="Approval Queue">
        <div className="space-y-3">
          {depositRequests.length === 0 ? (
            <p className="text-slate-300">No deposit requests available.</p>
          ) : (
            depositRequests.map((request) => (
              <div key={request.id} className="rounded-xl border border-cyan-900/30 bg-cyan-500/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-100">{request.userName || request.userEmail} • {request.amountUsdt} USDT</p>
                    <p className="mt-1 text-sm text-slate-400">
                      User ID: {request.userId} | Network: {request.network} | Submitted: {request.createdAt}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Wallet: {request.walletAddress || 'Not supplied'} | Tx Hash: {request.transactionHash || 'Pending'}
                    </p>
                    {request.rejectionReason ? (
                      <p className="mt-1 text-sm text-rose-300">Rejection reason: {request.rejectionReason}</p>
                    ) : null}
                  </div>
                  <StatusPill status={request.status} />
                </div>
                {request.screenshotDataUrl ? (
                  <div className="mt-3 rounded-lg border border-cyan-800/30 bg-[#071830]/60 p-2">
                    <img src={request.screenshotDataUrl} alt={`Deposit proof ${request.id}`} className="max-h-48 rounded-md object-contain" />
                  </div>
                ) : null}
                {request.status === 'Approved' || request.status === 'Rejected' ? (
                  <p className="mt-3 text-sm text-slate-400">This deposit has already been finalized.</p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-70" disabled={busyId === request.id} onClick={() => void updateStatus(request, 'Approved')}>
                      {busyId === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : '✅ Accept'}
                    </button>
                    <button className="btn-ghost inline-flex items-center gap-2 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-70" disabled={busyId === request.id} onClick={() => void updateStatus(request, 'Rejected')}>
                      {busyId === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : '❌ Reject'}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </PanelCard>
      {toast ? <Toast type={toast.type} message={toast.message} /> : null}
    </div>
  );
}
