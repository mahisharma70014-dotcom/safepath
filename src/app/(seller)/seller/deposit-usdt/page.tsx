"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { Toast } from "@/components/ui/toast";
import { usePollingJson } from "@/hooks/use-polling-json";
import type { DepositSettings } from "@/lib/data-model";
import { Copy } from "lucide-react";
import { useState } from "react";

export default function DepositUsdtPage() {
  const { data, refresh } = usePollingJson<{
    settings: DepositSettings;
  }>("/api/settings/deposit");
  const { data: walletData } = usePollingJson<{
    wallet: { availableUsdt: number };
  }>("/api/wallet");
  const settings =
    data?.settings ??
    ({ qrCodeDataUrl: "", walletAddress: "", network: "TRC20", walletLabel: "", enabled: false } as DepositSettings);
  const [amount, setAmount] = useState(0);
  const [screenshotName, setScreenshotName] = useState("");
  const [screenshotDataUrl, setScreenshotDataUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const available = walletData?.wallet.availableUsdt ?? 0;

  const copyAddress = async () => {
    await navigator.clipboard.writeText(settings.walletAddress);
    setCopied(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Deposit USDT</h2>
      <PanelCard
        title="Deposit Wallet"
        subtitle="Use the details below to transfer USDT safely"
      >
        {!settings.enabled ? (
          <p className="rounded-xl border border-amber-400/30 bg-amber-300/10 p-4 text-amber-100">
            Deposit wallet is temporarily disabled by admin.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-cyan-800/40 bg-cyan-500/5 p-4">
              <p className="mb-3 text-sm text-slate-400">QR Code</p>
              {settings.qrCodeDataUrl ? (
                <img
                  src={settings.qrCodeDataUrl}
                  alt="Deposit QR"
                  className="mx-auto h-52 w-52 rounded-lg border border-cyan-700/40 bg-white p-2"
                />
              ) : (
                <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-lg border border-dashed border-cyan-700/40 text-sm text-slate-400">
                  QR not uploaded yet
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-cyan-800/40 bg-cyan-500/5 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">Network</p>
                <p className="mt-1 text-lg font-semibold text-cyan-100">{settings.network}</p>
              </div>

              <div className="rounded-xl border border-cyan-800/40 bg-cyan-500/5 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">Wallet Label</p>
                <p className="mt-1 text-slate-100">{settings.walletLabel || "-"}</p>
              </div>

              <div className="rounded-xl border border-cyan-800/40 bg-cyan-500/5 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">Wallet Address</p>
                <p className="mt-1 break-all font-mono text-sm text-slate-100">{settings.walletAddress}</p>
                <button
                  className="btn-primary mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
                  onClick={copyAddress}
                >
                  <Copy size={14} />
                  Copy Address
                </button>
              </div>

              <div className="rounded-xl border border-cyan-800/40 bg-cyan-500/5 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">Available Balance</p>
                <p className="mt-1 text-lg font-semibold text-cyan-100">{available} USDT</p>
              </div>
            </div>
          </div>
        )}
      </PanelCard>

      <PanelCard title="Submit Deposit Request" subtitle="Upload payment proof for admin verification">
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();

            if (!settings.enabled) {
              setError("Deposit wallet is disabled by admin.");
              return;
            }

            if (amount <= 0) {
              setError("Enter a valid deposit amount.");
              return;
            }

            if (!screenshotName) {
              setError("Upload screenshot before submitting request.");
              return;
            }

            const response = await fetch("/api/requests", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                type: "deposit",
                amountUsdt: amount,
                network: settings.network,
                walletAddress: settings.walletAddress,
                screenshotName,
                screenshotDataUrl,
              }),
            });

            const payload = (await response.json()) as { message?: string };
            if (!response.ok) {
              setError(payload.message ?? "Unable to submit deposit request.");
              return;
            }

            setError("");
            setSubmitted(true);
            setAmount(0);
            setScreenshotName("");
            setScreenshotDataUrl("");
            window.setTimeout(() => setSubmitted(false), 4000);
            void refresh();
          }}
        >
          <div>
            <label className="mb-1 block text-sm text-slate-300">Deposit Amount (USDT)</label>
            <input
              className="input-base"
              type="number"
              min={1}
              value={amount || ""}
              onChange={(event) => setAmount(Number(event.target.value || 0))}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Upload Screenshot</label>
            <input
              className="input-base"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setScreenshotName(file?.name ?? "");
                if (!file) {
                  setScreenshotDataUrl("");
                  return;
                }

                const reader = new FileReader();
                reader.onload = () => setScreenshotDataUrl(String(reader.result ?? ""));
                reader.readAsDataURL(file);
              }}
              required
            />
          </div>
          {error ? <p className="md:col-span-2 text-sm text-rose-300">{error}</p> : null}
          <button className="btn-primary md:col-span-2 py-3 font-semibold">Submit Request</button>
        </form>
      </PanelCard>

      {copied ? <Toast type="success" message="Wallet address copied." /> : null}
      {submitted ? (
        <div className="rounded-2xl border border-cyan-700/40 bg-cyan-500/10 p-4 text-sm text-cyan-100">
          Deposit request submitted successfully. It will appear in your order history with Pending status and be reviewed by the admin team.
        </div>
      ) : null}
    </div>
  );
}
