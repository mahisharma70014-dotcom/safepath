import { RevenueChart } from "@/components/charts/revenue-chart";
import { PanelCard } from "@/components/ui/panel-card";
import { adminMetrics } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard Analytics</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {adminMetrics.map((metric) => (
          <PanelCard key={metric.label} title={metric.label}>
            <p className="text-2xl font-semibold text-slate-100">{metric.value}</p>
            <p className="mt-2 text-sm text-cyan-300">{metric.trend}</p>
          </PanelCard>
        ))}
      </div>
      <PanelCard title="Revenue Dashboard" subtitle="30 day platform performance">
        <RevenueChart />
      </PanelCard>
    </div>
  );
}
