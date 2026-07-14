import { PanelCard } from "@/components/ui/panel-card";

export default function SellerNotificationsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Notifications</h2>
      <PanelCard>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>Order SPO-24391 moved to Processing.</li>
          <li>Your KYC review has started.</li>
          <li>Wallet settlement completed for INR 82,110.</li>
        </ul>
      </PanelCard>
    </div>
  );
}
