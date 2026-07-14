import { PanelCard } from "@/components/ui/panel-card";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Reports</h2>
      <PanelCard title="Operational Reports">
        <p className="text-slate-300">Generate daily settlement, dispute, and compliance reports.</p>
      </PanelCard>
    </div>
  );
}
