import { PanelCard } from "@/components/ui/panel-card";

export default function AdminSecurityLogsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Security Logs</h2>
      <PanelCard title="Recent Events">
        <ul className="space-y-2 text-sm text-slate-300">
          <li>Admin login - 14 Jul 2026 15:22 IST - Success</li>
          <li>Role policy updated - 14 Jul 2026 14:05 IST</li>
          <li>Large withdrawal hold triggered - 14 Jul 2026 12:11 IST</li>
        </ul>
      </PanelCard>
    </div>
  );
}
