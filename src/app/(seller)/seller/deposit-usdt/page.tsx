"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { StatusPill } from "@/components/ui/status-pill";
import { Toast } from "@/components/ui/toast";
import { usePollingJson } from "@/hooks/use-polling-json";
import { defaultDepositSettings, type DepositSettings, type NetworkType, type RequestRecord } from "@/lib/data-model";
import { Copy, Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

const NETWORK_OPTIONS: NetworkType[] = ["TRC20", "BEP20", "ERC20"];

type ToastState = { type: "success" | "error" | "info"; message: string };

export default function DepositUsdtPage() {
  const { data, refresh } = usePollingJson<{ settings: DepositSettings }>('/api/settings/deposit');
  const { data: walletData } = usePollingJson<{ wallet: { availableUsdt: number } }>('/api/wallet');
  const { data: requestsData, refresh: refreshRequests } = usePollingJson<{ requests: RequestRecord[] }>('/api/requests?scope=mine', 2500);
  const settings = data?.settings ?? defaultDepositSettings;
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>('TRC20');
  const [networkInitialized, setNetworkInitialized] = useState(false);
  const [amount, setAmount] = useState(0);
  const [transactionHash, setTransactionHash] = useState('');
  const [screenshotName, setScreenshotName] = useState('');
  const [screenshotDataUrl, setScreenshotDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const available = walletData?.wallet.availableUsdt ?? 0;
  const depositRequests = (requestsData?.requests ?? []).filter((request) => request.type === 'deposit');
  const totalDeposits = depositRequests.length;
  const totalApproved = depositRequests.filter((request) => request.status === 'Approved').length;
  const totalPending = depositRequests.filter((request) => request.status === 'Pending').length;
  const totalRejected = depositRequests.filter((request) => request.status === 'Rejected').length;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const savedNetwork = window.localStorage.getItem('deposit-selected-network') as NetworkType | null;
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
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('deposit-selected-network', selectedNetwork);
  }, [selectedNetwork]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const currentWallet =
    settings.wallets[selectedNetwork] ??
    settings.wallets[settings.activeNetwork] ??
    defaultDepositSettings.wallets[selectedNetwork];

  const copyAddress = async () => {
    await navigator.clipboard.writeText(currentWallet.walletAddress);
    setCopied(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (!currentWallet.enabled) {
      setToast({ type: 'error', message: 'Deposit wallet is disabled by admin.' });
      return;
    }

    if (amount <= 0) {
      setToast({ type: 'error', message: 'Enter a valid deposit amount.' });
      return;
    }

    if (!screenshotName || !screenshotDataUrl) {
      setToast({ type: 'error', message: 'Upload a payment screenshot before submitting the request.' });
      return;
    }

    setSubmitting(true);
    setToast(null);

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'deposit',
          amountUsdt: amount,
          network: selectedNetwork,
          walletAddress: currentWallet.walletAddress,
          screenshotName,
          screenshotDataUrl,
          transactionHash: transactionHash.trim() || undefined,
        }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to submit deposit request.');
      }

      setAmount(0);
      setTransactionHash('');
      setScreenshotName('');
      setScreenshotDataUrl('');
      setSubmitted(true);
      setToast({ type: 'success', message: 'Deposit Request Submitted. Pending admin approval.' });
      await refresh();
      await refreshRequests();
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Unable to submit deposit request.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Deposit USDT</h2>
      <PanelCard title="Deposit Wallet" subtitle="Use the details below to transfer USDT safely">
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
                  <p className="mt-1 text-slate-100">{currentWallet.walletLabel || '-'}</p>
                </div>

                <div className="rounded-xl border border-cyan-800/40 bg-cyan-500/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Wallet Address</p>
                  <p className="mt-1 break-all font-mono text-sm text-slate-100">{currentWallet.walletAddress || 'Not set'}</p>
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
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Deposit Amount (USDT)</label>
            <input
              className="input-base"
              type="number"
              min={1}
              value={amount || ''}
              onChange={(event) => setAmount(Number(event.target.value || 0))}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Transaction Hash (optional)</label>
            <input
              className="input-base"
              type="text"
              value={transactionHash}
              onChange={(event) => setTransactionHash(event.target.value)}
              placeholder="Tx hash"
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
                setScreenshotName(file?.name ?? '');
                if (!file) {
                  setScreenshotDataUrl('');
                  return;
                }

                const reader = new FileReader();
                reader.onload = () => setScreenshotDataUrl(String(reader.result ?? ''));
                reader.readAsDataURL(file);
              }}
              required
            />
          </div>
          <div className="rounded-xl border border-cyan-800/40 bg-cyan-500/5 p-3 text-sm text-slate-300">
            <p className="font-medium text-slate-100">Payment proof</p>
            <p className="mt-1">{screenshotName || 'No proof selected yet.'}</p>
          </div>
          {toast ? <p className={`md:col-span-2 text-sm ${toast.type === 'error' ? 'text-rose-300' : 'text-emerald-300'}`}>{toast.message}</p> : null}
          <button className="btn-primary md:col-span-2 inline-flex items-center justify-center gap-2 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-70" disabled={submitting || !currentWallet.enabled} type="submit">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Submit Deposit'
            )}
          </button>
        </form>
      </PanelCard>

      <PanelCard title="Deposit Activity" subtitle="Track your latest deposits and live approval status">
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          {[
            { label: 'Total Deposits', value: totalDeposits },
            { label: 'Approved', value: totalApproved },
            { label: 'Pending', value: totalPending },
            { label: 'Rejected', value: totalRejected },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-cyan-800/30 bg-[#071830]/60 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-400">{stat.label}</p>
              <p className="mt-2 text-xl font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
        {submitted ? (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-100">
            <p className="font-medium">Deposit Request Submitted</p>
            <p className="text-sm text-slate-300">Your deposit request is now visible in Pending Approval and will update as the admin acts on it.</p>
          </div>
        ) : null}

        {depositRequests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-cyan-800/40 p-6 text-center text-sm text-slate-400">
            No deposit history yet. Submit a deposit request to see it here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="px-3 py-2">Deposit ID</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Network</th>
                  <th className="px-3 py-2">UTR / TxID</th>
                  <th className="px-3 py-2">Screenshot</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {depositRequests
                  .slice()
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .map((request) => (
                    <tr key={request.id} className="border-t border-cyan-900/30">
                      <td className="px-3 py-3 text-slate-300">{request.id.slice(0, 8)}</td>
                      <td className="px-3 py-3 text-slate-100">{request.amountUsdt} USDT</td>
                      <td className="px-3 py-3 text-slate-300">{request.network}</td>
                      <td className="px-3 py-3 text-slate-300">{request.transactionHash ?? '—'}</td>
                      <td className="px-3 py-3 text-slate-300">
                        {request.screenshotName ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200">
                            {request.screenshotName}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-3 text-slate-300">{request.createdAt}</td>
                      <td className="px-3 py-3"><StatusPill status={request.status} /></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>

      {copied ? <Toast type="success" message="Wallet address copied." /> : null}
      {toast ? <Toast type={toast.type} message={toast.message} /> : null}
    </div>
  );
}
