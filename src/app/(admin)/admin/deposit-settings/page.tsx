"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { Toast } from "@/components/ui/toast";
import { usePollingJson } from "@/hooks/use-polling-json";
import { defaultDepositSettings, type DepositSettings, type NetworkType } from "@/lib/data-model";
import { ChangeEvent, useEffect, useState } from "react";

const NETWORK_OPTIONS: NetworkType[] = ["TRC20", "BEP20", "ERC20"];

export default function AdminDepositSettingsPage() {
  const [settings, setSettings] = useState<DepositSettings>(defaultDepositSettings);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>(defaultDepositSettings.activeNetwork);
  const [initialized, setInitialized] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const { data, refresh } = usePollingJson<{ settings: DepositSettings }>("/api/settings/deposit");

  useEffect(() => {
    const loaded = data?.settings;
    if (!loaded || initialized) return;
    setSettings(loaded);
    setSelectedNetwork(loaded.activeNetwork);
    setInitialized(true);
  }, [data, initialized]);

  const wallet = settings.wallets[selectedNetwork];

  const updateWallet = (partial: Partial<typeof wallet>) => {
    setSettings((prev) => ({
      ...prev,
      activeNetwork: selectedNetwork,
      wallets: {
        ...prev.wallets,
        [selectedNetwork]: {
          ...prev.wallets[selectedNetwork],
          ...partial,
        },
      },
    }));
  };

  const onQrUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      updateWallet({ qrCodeDataUrl: result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Deposit Settings</h2>
      <PanelCard title="Admin Configurable Deposit Wallet" subtitle="Manage QR, address, network, and wallet status">
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();

            setSaved(false);
            setError("");

            if (!wallet.walletAddress.trim()) {
              setError("Enter a valid deposit wallet address.");
              return;
            }
            if (!wallet.qrCodeDataUrl) {
              setError("Upload a QR code image for the wallet.");
              return;
            }

            const response = await fetch("/api/settings/deposit", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify(settings),
            });

            const payload = (await response.json()) as { message?: string };
            if (!response.ok) {
              setError(payload.message ?? "Unable to save deposit settings.");
              return;
            }

            setSaved(true);
            await refresh();
          }}
        >
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-slate-300">Network</label>
            <select
              className="input-base"
              value={selectedNetwork}
              onChange={(event) => setSelectedNetwork(event.target.value as NetworkType)}
            >
              {NETWORK_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-slate-300">Upload Deposit QR Code</label>
            <input className="input-base" type="file" accept="image/*" onChange={onQrUpload} />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-slate-300">USDT Wallet Address</label>
            <input
              className="input-base"
              value={wallet.walletAddress}
              onChange={(event) => updateWallet({ walletAddress: event.target.value })}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Wallet Label (Optional)</label>
            <input
              className="input-base"
              value={wallet.walletLabel}
              onChange={(event) => updateWallet({ walletLabel: event.target.value })}
              placeholder="Primary Wallet"
            />
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-300 md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={wallet.enabled}
                onChange={(event) => updateWallet({ enabled: event.target.checked })}
                className="h-4 w-4 rounded"
              />
              Enable Deposit Wallet
            </label>
          </div>

          <button className="btn-primary md:col-span-2 py-3 font-semibold">Save Deposit Settings</button>
        </form>
      </PanelCard>

      <PanelCard title="Live Preview" subtitle="Customer view preview for Deposit USDT">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-cyan-800/40 bg-cyan-500/5 p-4">
            <p className="text-sm text-slate-400">QR Code</p>
            {wallet.qrCodeDataUrl ? (
              <img src={wallet.qrCodeDataUrl} alt="QR Preview" className="mt-3 h-44 w-44 rounded-lg bg-white p-2" />
            ) : (
              <div className="mt-3 flex h-44 w-44 items-center justify-center rounded-lg border border-dashed border-cyan-700/40 text-xs text-slate-400">
                No QR uploaded for {selectedNetwork}
              </div>
            )}
          </div>
          <div className="rounded-xl border border-cyan-800/40 bg-cyan-500/5 p-4 text-sm text-slate-300">
            <p>Network: <span className="text-cyan-100">{selectedNetwork}</span></p>
            <p className="mt-2 break-all">Address: {wallet.walletAddress || "Not set"}</p>
            <p className="mt-2">Label: {wallet.walletLabel || "-"}</p>
            <p className="mt-2">Status: {wallet.enabled ? "Enabled" : "Disabled"}</p>
          </div>
        </div>
      </PanelCard>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {saved ? <Toast type="success" message="Deposit settings saved successfully." /> : null}
    </div>
  );
}
