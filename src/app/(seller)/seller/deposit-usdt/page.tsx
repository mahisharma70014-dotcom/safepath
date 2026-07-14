"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { Toast } from "@/components/ui/toast";
import { usePollingJson } from "@/hooks/use-polling-json";
import type { DepositSettings, NetworkType } from "@/lib/data-model";
import { Copy } from "lucide-react";
import { useEffect, useState } from "react";

const NETWORK_OPTIONS: NetworkType[] = ["TRC20", "BEP20", "ERC20"];

const defaultDepositSettings: DepositSettings = {
  activeNetwork: "TRC20",
  wallets: {
    TRC20: { qrCodeDataUrl: "", walletAddress: "", walletLabel: "TRC20 Wallet", enabled: false },
    BEP20: { qrCodeDataUrl: "", walletAddress: "", walletLabel: "BEP20 Wallet", enabled: false },
    ERC20: { qrCodeDataUrl: "", walletAddress: "", walletLabel: "ERC20 Wallet", enabled: false },
  },
};

export default function DepositUsdtPage() {
  const { data, refresh } = usePollingJson<{
    settings: DepositSettings;
  }>("/api/settings/deposit");
  const { data: walletData } = usePollingJson<{
    wallet: { availableUsdt: number };
  }>("/api/wallet");
  const settings = data?.settings ?? defaultDepositSettings;
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>("TRC20");
  const [networkInitialized, setNetworkInitialized] = useState(false);
  const [amount, setAmount] = useState(0);
  const [screenshotName, setScreenshotName] = useState("");
  const [screenshotDataUrl, setScreenshotDataUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const available = walletData?.wallet.availableUsdt ?? 0;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedNetwork = localStorage.getItem("deposit-selected-network") as NetworkType | null;
    if (savedNetwork && NETWORK_OPTIONS.includes(savedNetwork)) {
      setSelectedNetwork(savedNetwork);
      setNetworkInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!networkInitialized && data?.settings) {
      setSelectedNetwork(data.settings.activeNetwork);
      setNetworkInitialized(true);
    }
  }, [data?.settings, networkInitialized]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem("deposit-selected-network", selectedNetwork);
  }, [selectedNetwork]);

  const currentWallet =
    settings.wallets[selectedNetwork] ??
    settings.wallets[settings.activeNetwork] ??
    defaultDepositSettings.wallets[selectedNetwork];

  const copyAddress = async () => {
    await navigator.clipboard.writeText(currentWallet.walletAddress);
    setCopied(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Deposit USDT</h2>
      <PanelCard
        title="Deposit Wallet"
        subtitle="Use the details below to transfer USDT safely"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-3">
            <label className="mb-1 block text-sm text-slate-300">Choose Network</label>
            <select
              className="input-base"
              value={selectedNetwork}
              onChange={(event) => setSelectedNetwork(event.target.value as NetworkType)}
            >
              {NETWORK_OPTIONS.map((network) => (
                <option key={network} value={network}>
                  {network}
                </option>
              ))}
            </select>
          </div>

          {!currentWallet.enabled ? (
            <div className="md:col-span-3 rounded-xl border border-amber-400/30 bg-amber-300/10 p-4 text-amber-100">
              Deposit wallet for {selectedNetwork} is disabled by admin.
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-cyan-800/40 bg-cyan-500/5 p-4">
                <p className="mb-3 text-sm text-slate-400">QR Code</p>
                {currentWallet.qrCodeDataUrl ? (
                  <img
                    src={currentWallet.qrCodeDataUrl}
                    alt="Deposit QR"
                    className="mx-auto h-52 w-52 rounded-lg border border-cyan-700/40 bg-white p-2"
                  />
                ) : (
                  <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-lg border border-dashed border-cyan-700/40 text-sm text-slate-400">
                    QR not uploaded yet for {selectedNetwork}
                  </div>
                )}
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="rounded-xl border border-cyan-800/40 bg-cyan-500/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Network</p>
                  <p className="mt-1 text-lg font-semibold text-cyan-100">{selectedNetwork}</p>
                </div>

                <div className="rounded-xl border border-cyan-800/40 bg-cyan-500/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Wallet Label</p>
                  <p className="mt-1 text-slate-100">{currentWallet.walletLabel || "-"}</p>
                </div>

                <div className="rounded-xl border border-cyan-800/40 bg-cyan-500/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Wallet Address</p>
                  <p className="mt-1 break-all font-mono text-sm text-slate-100">{currentWallet.walletAddress || "Not set"}</p>
                  <button
                    className="btn-primary mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
                    onClick={copyAddress}
                    type="button"
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
            </>
          )}
        </div>
      </PanelCard>

      <PanelCard title="Submit Deposit Request" subtitle="Upload payment proof for admin verification">
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();

            if (!currentWallet.enabled) {
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
                network: selectedNetwork,
                walletAddress: currentWallet.walletAddress,
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
