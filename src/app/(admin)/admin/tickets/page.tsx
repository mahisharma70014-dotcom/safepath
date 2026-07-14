"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { usePollingJson } from "@/hooks/use-polling-json";
import type { SupportTicket, SupportTicketStatus } from "@/lib/data-model";

export default function AdminTicketsPage() {
  const { data, refresh } = usePollingJson<{ tickets: SupportTicket[] }>("/api/tickets?scope=all", 3000);
  const tickets = data?.tickets ?? [];

  const updateStatus = async (id: string, status: SupportTicketStatus) => {
    await fetch(`/api/tickets/${id}`, {
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
      <h2 className="text-2xl font-semibold">Support Tickets</h2>
      <PanelCard title="Open Tickets">
        {tickets.length === 0 ? (
          <p className="text-slate-300">No support tickets yet.</p>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-xl border border-cyan-900/30 bg-cyan-500/5 p-4">
                <p className="font-medium text-slate-100">{ticket.subject}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {ticket.userEmail} | {ticket.category} | {ticket.status} | {ticket.createdAt}
                </p>
                <p className="mt-2 text-sm text-slate-300">{ticket.message}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-ghost px-3 py-2 text-sm" onClick={() => void updateStatus(ticket.id, "In Progress") }>
                    Mark In Progress
                  </button>
                  <button className="btn-primary px-3 py-2 text-sm" onClick={() => void updateStatus(ticket.id, "Resolved") }>
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}
