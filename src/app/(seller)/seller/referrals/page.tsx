import { PanelCard } from "@/components/ui/panel-card";

export default function ReferralsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Referral System</h2>
      <PanelCard title="Your Referral Code" subtitle="Share and earn rewards">
        <p className="rounded-lg border border-cyan-800/40 bg-cyan-500/10 px-3 py-2 font-mono text-cyan-100">SAFEPATH-SELL-2914</p>
        <p className="mt-3 text-sm text-slate-400">Referred users: 24 | Earnings: INR 12,600</p>
      </PanelCard>
    </div>
  );
}
