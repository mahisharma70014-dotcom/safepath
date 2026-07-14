import { PanelCard } from "@/components/ui/panel-card";

export default function AdminWalletsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Wallet Management</h2>
      <PanelCard title="Platform Wallets">
        <p className="text-slate-300">Monitor hot, warm, and settlement wallets.</p>
      </PanelCard>
    </div>
  );
}
