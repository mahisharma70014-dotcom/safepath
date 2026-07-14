"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { Toast } from "@/components/ui/toast";
import { usePollingJson } from "@/hooks/use-polling-json";
import { useEffect, useState } from "react";

type SiteSettings = {
  maintenanceMessage: string;
  minimumSellAmount: number;
  maintenanceMode: boolean;
};

export default function AdminSettingsPage() {
  const { data, refresh } = usePollingJson<{ settings: SiteSettings }>('/api/settings/site');
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [minimumSellAmount, setMinimumSellAmount] = useState(100);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data?.settings) {
      setMaintenanceMessage(data.settings.maintenanceMessage ?? "");
      setMinimumSellAmount(data.settings.minimumSellAmount ?? 100);
      setMaintenanceMode(Boolean(data.settings.maintenanceMode));
    }
  }, [data]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch('/api/settings/site', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maintenanceMessage, minimumSellAmount, maintenanceMode }),
    });

    if (response.ok) {
      setSaved(true);
      await refresh();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">System Settings</h2>
      <PanelCard title="Platform Controls" subtitle="These values are stored in Firestore and used across the app">
        <form className="space-y-3" onSubmit={handleSave}>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={maintenanceMode} onChange={(event) => setMaintenanceMode(event.target.checked)} className="h-4 w-4 rounded" />
            Maintenance Mode
          </label>
          <input className="input-base" placeholder="Maintenance message" value={maintenanceMessage} onChange={(event) => setMaintenanceMessage(event.target.value)} />
          <input className="input-base" type="number" min="1" placeholder="Minimum sell amount" value={minimumSellAmount} onChange={(event) => setMinimumSellAmount(Number(event.target.value || 0))} />
          <button className="btn-primary px-4 py-2 text-sm font-semibold">Save Settings</button>
        </form>
      </PanelCard>
      {saved ? <Toast type="success" message="Site settings saved successfully." /> : null}
    </div>
  );
}
