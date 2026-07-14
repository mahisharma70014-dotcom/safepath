import { PanelCard } from "@/components/ui/panel-card";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">User Management</h2>
      <PanelCard title="Total Users" subtitle="Monitor and manage user records">
        <p className="text-3xl font-semibold">48,390</p>
      </PanelCard>
    </div>
  );
}
