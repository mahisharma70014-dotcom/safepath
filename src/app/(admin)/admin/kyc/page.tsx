import { PanelCard } from "@/components/ui/panel-card";

export default function AdminKycPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Pending KYC</h2>
      <PanelCard title="KYC Queue" subtitle="Aadhaar, PAN, and selfie verification">
        <p className="text-slate-300">528 requests pending review.</p>
      </PanelCard>
    </div>
  );
}
