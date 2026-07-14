"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { Toast } from "@/components/ui/toast";
import { usePollingJson } from "@/hooks/use-polling-json";
import { defaultDepositSettings, type DepositSettings, type NetworkType } from "@/lib/data-model";
import { ChangeEvent, useEffect, useState } from "react";

export default function AdminDepositSettingsPage() {
  const [walletAddress, setWalletAddress] = useState(defaultDepositSettings.walletAddress);
  const [network, setNetwork] = useState<NetworkType>(defaultDepositSettings.network);
  const [walletLabel, setWalletLabel] = useState(defaultDepositSettings.walletLabel);
  const [enabled, setEnabled] = useState(defaultDepositSettings.enabled);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(defaultDepositSettings.qrCodeDataUrl);
  const [saved, setSaved] = useState(false);
  const { data, refresh } = usePollingJson<{ settings: DepositSettings }>("/api/settings/deposit");

  useEffect(() => {
    const settings = data?.settings;
    if (!settings) return;
    setWalletAddress(settings.walletAddress);
    setNetwork(settings.network);
    setWalletLabel(settings.walletLabel);
    setEnabled(settings.enabled);
    setQrCodeDataUrl(settings.qrCodeDataUrl);
  }, [data]);

  const onQrUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      setQrCodeDataUrl(result);
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

            const response = await fetch("/api/settings/deposit", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
              walletAddress,
              network,
              walletLabel,
              enabled,
              qrCodeDataUrl,
              }),
            });

            if (!response.ok) {
              return;
            }

            setSaved(true);
            void refresh();
          }}
        >
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-slate-300">Upload Deposit QR Code</label>
            <input className="input-base" type="file" accept="image/*" onChange={onQrUpload} />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-slate-300">USDT Wallet Address</label>
            <input
              className="input-base"
              value={walletAddress}
              onChange={(event) => setWalletAddress(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Network</label>
            <select
              className="input-base"
              value={network}
              onChange={(event) => setNetwork(event.target.value as NetworkType)}
            >
              <option value="TRC20">TRC20</option>
              <option value="BEP20">BEP20</option>
              <option value="ERC20">ERC20</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Wallet Label (Optional)</label>
            <input
              className="input-base"
              value={walletLabel}
              onChange={(event) => setWalletLabel(event.target.value)}
              placeholder="Primary Wallet"
            />
          </div>

          <label className="md:col-span-2 flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
              className="h-4 w-4 rounded"
            />
            Enable Deposit Wallet
          </label>

          <button className="btn-primary md:col-span-2 py-3 font-semibold">Save Deposit Settings</button>
        </form>
      </PanelCard>

      <PanelCard title="Live Preview" subtitle="Customer view preview for Deposit USDT">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-cyan-800/40 bg-cyan-500/5 p-4">
            <p className="text-sm text-slate-400">QR Code</p>
            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt="QR Preview" className="mt-3 h-44 w-44 rounded-lg bg-white p-2" />
            ) : (
              <div className="mt-3 flex h-44 w-44 items-center justify-center rounded-lg border border-dashed border-cyan-700/40 text-xs text-slate-400">
                No QR uploaded
              </div>
            )}
          </div>
          <div className="rounded-xl border border-cyan-800/40 bg-cyan-500/5 p-4 text-sm text-slate-300">
            <p>Network: <span className="text-cyan-100">{network}</span></p>
            <p className="mt-2 break-all">Address: {walletAddress}</p>
            <p className="mt-2">Label: {walletLabel || "-"}</p>
            <p className="mt-2">Status: {enabled ? "Enabled" : "Disabled"}</p>
          </div>
        </div>
      </PanelCard>

      {saved ? <Toast type="success" message="Deposit settings saved successfully." /> : null}
    </div>
  );
}
