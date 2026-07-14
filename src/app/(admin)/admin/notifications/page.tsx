import { PanelCard } from "@/components/ui/panel-card";

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Notifications</h2>
      <PanelCard title="System Alerts">
        <ul className="space-y-2 text-sm text-slate-300">
          <li>High-value sell request flagged for review.</li>
          <li>Security event: new admin login from Mumbai.</li>
          <li>KYC backlog increased by 5%.</li>
        </ul>
      </PanelCard>
    </div>
  );
}
