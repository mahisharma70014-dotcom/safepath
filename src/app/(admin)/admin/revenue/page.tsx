import { RevenueChart } from "@/components/charts/revenue-chart";
import { PanelCard } from "@/components/ui/panel-card";

export default function AdminRevenuePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Revenue Dashboard</h2>
      <PanelCard title="Revenue Trend" subtitle="Platform earnings overview">
        <RevenueChart />
      </PanelCard>
    </div>
  );
}
