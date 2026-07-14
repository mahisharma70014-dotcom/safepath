import { PanelCard } from "@/components/ui/panel-card";

export default function AdminTicketsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Support Tickets</h2>
      <PanelCard title="Open Tickets">
        <p className="text-slate-300">187 open tickets, 61 high priority.</p>
      </PanelCard>
    </div>
  );
}
