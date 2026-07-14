import { PanelCard } from "@/components/ui/panel-card";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Orders Management</h2>
      <PanelCard title="Sell Requests" subtitle="Review buy and sell requests">
        <p className="text-slate-300">Sell Requests: 1,240 | Buy Requests: 930</p>
      </PanelCard>
    </div>
  );
}
