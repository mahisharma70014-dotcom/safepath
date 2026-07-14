import { PanelCard } from "@/components/ui/panel-card";

export default function AdminRolesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Admin Roles & Permissions</h2>
      <PanelCard title="Role Matrix">
        <p className="text-slate-300">Super Admin, Risk Analyst, KYC Reviewer, Support Lead.</p>
      </PanelCard>
    </div>
  );
}
