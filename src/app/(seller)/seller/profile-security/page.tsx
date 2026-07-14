import { PanelCard } from "@/components/ui/panel-card";

export default function ProfileSecurityPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Profile & Security</h2>
      <PanelCard title="Account Security" subtitle="Update your credentials and security settings">
        <form className="grid gap-3 md:grid-cols-2">
          <input className="input-base" placeholder="Full Name" defaultValue="Seller One" />
          <input className="input-base" placeholder="Company Email" defaultValue="ops@company.com" />
          <input className="input-base" placeholder="Current Password" type="password" />
          <input className="input-base" placeholder="New Password" type="password" />
          <button className="btn-primary md:col-span-2 px-4 py-2 text-sm font-semibold">Save Changes</button>
        </form>
      </PanelCard>
    </div>
  );
}
