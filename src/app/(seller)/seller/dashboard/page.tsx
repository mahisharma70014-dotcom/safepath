import { RevenueChart } from "@/components/charts/revenue-chart";
import { PanelCard } from "@/components/ui/panel-card";
import { sellerMetrics } from "@/lib/mock-data";
import Link from "next/link";

export default function SellerDashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard Overview</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/seller/deposit-usdt" className="glass-card rounded-2xl p-5 transition hover:translate-y-[-2px]">
          <p className="text-xs uppercase tracking-wide text-cyan-300/90">Card 1</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-50">Deposit USDT</h3>
          <p className="mt-2 text-sm text-slate-400">View admin-configured deposit wallet and transfer safely.</p>
        </Link>

        <Link href="/seller/sell-usdt" className="glass-card rounded-2xl p-5 transition hover:translate-y-[-2px]">
          <p className="text-xs uppercase tracking-wide text-cyan-300/90">Card 2</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-50">Sell USDT</h3>
          <p className="mt-2 text-sm text-slate-400">Create sell requests, track statuses, and view history.</p>
        </Link>

        <Link href="/seller/withdraw-usdt" className="glass-card rounded-2xl p-5 transition hover:translate-y-[-2px]">
          <p className="text-xs uppercase tracking-wide text-cyan-300/90">Card 3</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-50">Withdraw USDT</h3>
          <p className="mt-2 text-sm text-slate-400">Submit withdrawal requests with network-wise validation.</p>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sellerMetrics.map((metric) => (
          <PanelCard key={metric.label} title={metric.label}>
            <p className="text-2xl font-semibold text-slate-100">{metric.value}</p>
            <p className="mt-2 text-sm text-cyan-300">{metric.trend}</p>
          </PanelCard>
        ))}
      </div>

      <PanelCard title="Weekly Sell Volume" subtitle="Live business performance">
        <RevenueChart />
      </PanelCard>
    </div>
  );
}
