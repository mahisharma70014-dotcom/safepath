import { PanelCard } from "@/components/ui/panel-card";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">System Settings</h2>
      <PanelCard title="Platform Controls">
        <form className="space-y-3">
          <input className="input-base" placeholder="Maintenance message" />
          <input className="input-base" placeholder="Minimum sell amount" defaultValue="100" />
          <button className="btn-primary px-4 py-2 text-sm font-semibold">Save Settings</button>
        </form>
      </PanelCard>
    </div>
  );
}
