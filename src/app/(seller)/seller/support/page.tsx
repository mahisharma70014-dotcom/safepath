"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { Toast } from "@/components/ui/toast";
import { usePollingJson } from "@/hooks/use-polling-json";
import type { SupportTicket } from "@/lib/data-model";
import { useState } from "react";

export default function SupportPage() {
  const { data, refresh } = usePollingJson<{ tickets: SupportTicket[] }>("/api/tickets?scope=mine", 3000);
  const tickets = data?.tickets ?? [];
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<SupportTicket["category"]>("Order issue");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Support Ticket</h2>
      <PanelCard title="Raise New Ticket">
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();

            const response = await fetch("/api/tickets", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ subject, category, message }),
            });

            const payload = (await response.json()) as { message?: string };
            if (!response.ok) {
              setError(payload.message ?? "Unable to create support ticket.");
              return;
            }

            setError("");
            setSubmitted(true);
            setSubject("");
            setCategory("Order issue");
            setMessage("");
            await refresh();
          }}
        >
          <input
            className="input-base"
            placeholder="Issue subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            required
          />
          <select
            className="input-base"
            value={category}
            onChange={(event) => setCategory(event.target.value as SupportTicket["category"])}
          >
            <option>Order issue</option>
            <option>Wallet issue</option>
            <option>KYC issue</option>
            <option>Account security</option>
          </select>
          <textarea
            className="input-base min-h-28"
            placeholder="Describe your issue"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
          />
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button className="btn-primary px-4 py-2 text-sm">Submit Ticket</button>
        </form>
      </PanelCard>

      <PanelCard title="Your Tickets">
        {tickets.length === 0 ? (
          <p className="text-slate-300">No tickets raised yet.</p>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-xl border border-cyan-900/30 bg-cyan-500/5 p-4">
                <p className="font-medium text-slate-100">{ticket.subject}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {ticket.category} | {ticket.status} | {ticket.createdAt}
                </p>
                <p className="mt-2 text-sm text-slate-300">{ticket.message}</p>
              </div>
            ))}
          </div>
        )}
      </PanelCard>

      {submitted ? <Toast type="success" message="Support ticket created." /> : null}
    </div>
  );
}
