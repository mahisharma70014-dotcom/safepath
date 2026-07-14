import { PanelCard } from "@/components/ui/panel-card";

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Support Ticket</h2>
      <PanelCard title="Raise New Ticket">
        <form className="space-y-3">
          <input className="input-base" placeholder="Issue subject" />
          <select className="input-base">
            <option>Order issue</option>
            <option>Wallet issue</option>
            <option>KYC issue</option>
            <option>Account security</option>
          </select>
          <textarea className="input-base min-h-28" placeholder="Describe your issue" />
          <button className="btn-primary px-4 py-2 text-sm">Submit Ticket</button>
        </form>
      </PanelCard>
    </div>
  );
}
