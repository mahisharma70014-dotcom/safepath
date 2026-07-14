import { PanelCard } from "@/components/ui/panel-card";

export default function PaymentMethodsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Payment Methods</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { title: "UPI", value: "merchant@safepath" },
          { title: "Bank", value: "HDFC •••• 4821" },
          { title: "Crypto Wallet", value: "TRC20 0x1a...48cf" },
        ].map((method) => (
          <PanelCard key={method.title} title={method.title}>
            <p className="text-slate-200">{method.value}</p>
          </PanelCard>
        ))}
      </div>
    </div>
  );
}
