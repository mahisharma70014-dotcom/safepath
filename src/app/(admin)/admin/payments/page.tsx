"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { Toast } from "@/components/ui/toast";
import { usePollingJson } from "@/hooks/use-polling-json";
import { defaultSellSettings, type SellSettings } from "@/lib/data-model";
import { useEffect, useState } from "react";

export default function AdminPaymentsPage() {
  const [settings, setSettings] = useState(defaultSellSettings);
  const [saved, setSaved] = useState(false);
  const { data, refresh } = usePollingJson<{ settings: SellSettings }>("/api/settings/sell");

  useEffect(() => {
    if (data?.settings) {
      setSettings(data.settings);
    }
  }, [data]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Payment Methods</h2>
      <PanelCard title="Sell Pricing & Payout Details" subtitle="Admin-defined pricing is used across the full system">
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            const response = await fetch("/api/settings/sell", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(settings),
            });

            if (!response.ok) {
              return;
            }
            setSaved(true);
            void refresh();
          }}
        >
          <input className="input-base" type="number" step="0.01" value={settings.upiRate} onChange={(event) => setSettings({ ...settings, upiRate: Number(event.target.value) })} placeholder="UPI Rate" required />
          <input className="input-base" type="number" step="0.01" value={settings.cdmRate} onChange={(event) => setSettings({ ...settings, cdmRate: Number(event.target.value) })} placeholder="CDM Rate" required />
          <input className="input-base" type="number" step="0.01" value={settings.mixRate} onChange={(event) => setSettings({ ...settings, mixRate: Number(event.target.value) })} placeholder="Mix Rate" required />
          <input className="input-base" value={settings.bankName} onChange={(event) => setSettings({ ...settings, bankName: event.target.value })} placeholder="Bank Name" required />
          <input className="input-base" value={settings.accountHolder} onChange={(event) => setSettings({ ...settings, accountHolder: event.target.value })} placeholder="Account Holder" required />
          <input className="input-base" value={settings.accountNumber} onChange={(event) => setSettings({ ...settings, accountNumber: event.target.value })} placeholder="Account Number" required />
          <input className="input-base" value={settings.ifsc} onChange={(event) => setSettings({ ...settings, ifsc: event.target.value })} placeholder="IFSC" required />
          <input className="input-base" value={settings.upiId} onChange={(event) => setSettings({ ...settings, upiId: event.target.value })} placeholder="UPI ID" required />
          <input className="input-base md:col-span-2" value={settings.upiHolder} onChange={(event) => setSettings({ ...settings, upiHolder: event.target.value })} placeholder="UPI Holder Name" required />
          <button className="btn-primary md:col-span-2 py-3 font-semibold">Save Payment Rules</button>
        </form>
      </PanelCard>
      {saved ? <Toast type="success" message="Sell pricing and payout details saved." /> : null}
    </div>
  );
}
