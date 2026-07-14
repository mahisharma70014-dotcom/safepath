"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { Toast } from "@/components/ui/toast";
import { usePollingJson } from "@/hooks/use-polling-json";
import { useState } from "react";

export default function WithdrawUsdtPage() {
  const { data: walletData, refresh: refreshWallet } = usePollingJson<{
    wallet: { availableUsdt: number };
  }>("/api/wallet");
  const [amount, setAmount] = useState(0);
  const [network, setNetwork] = useState<"TRC20" | "BEP20" | "ERC20">("TRC20");
  const [destinationWallet, setDestinationWallet] = useState("");
  const [screenshotName, setScreenshotName] = useState("");
  const [screenshotDataUrl, setScreenshotDataUrl] = useState("");
  const availableUsdt = walletData?.wallet.availableUsdt ?? 0;
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Withdraw USDT</h2>
      <PanelCard title="Create Withdraw Request" subtitle="Submit a secure withdrawal request">
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();

            if (amount <= 0) {
              setError("Enter a valid withdrawal amount.");
              return;
            }

            if (amount > availableUsdt) {
              setError("Available balance se zyada withdrawal allow nahi hai.");
              return;
            }

            try {
              if (!screenshotName) {
                setError("Upload screenshot before submitting withdraw request.");
                return;
              }

              const response = await fetch("/api/requests", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: "withdraw",
                  amountUsdt: amount,
                  network,
                  destinationWallet,
                  screenshotName,
                  screenshotDataUrl,
                }),
              });
              const payload = (await response.json()) as { message?: string };
              if (!response.ok) {
                throw new Error(payload.message ?? "Unable to submit withdraw request.");
              }

              await refreshWallet();
              setError("");
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : "Unable to submit withdraw request.");
              return;
            }

            setSubmitted(true);
          }}
        >
          <input
            className="input-base"
            placeholder="Amount (USDT)"
            type="number"
            min={1}
            value={amount || ""}
            onChange={(event) => setAmount(Number(event.target.value || 0))}
            required
          />
          <select className="input-base" value={network} onChange={(event) => setNetwork(event.target.value as "TRC20" | "BEP20" | "ERC20")} required>
            <option value="TRC20">TRC20</option>
            <option value="BEP20">BEP20</option>
            <option value="ERC20">ERC20</option>
          </select>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-slate-300">Available Balance</label>
            <div className="input-base">{availableUsdt.toLocaleString("en-IN")} USDT</div>
          </div>
          <input
            className="input-base md:col-span-2"
            placeholder="Destination Wallet Address"
            value={destinationWallet}
            onChange={(event) => setDestinationWallet(event.target.value)}
            required
          />
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-slate-300">Upload Withdrawal Screenshot</label>
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
          <button className="btn-primary md:col-span-2 py-3 font-semibold">Submit Withdraw Request</button>
        </form>
      </PanelCard>
      {submitted ? <Toast type="success" message="Withdraw request submitted." /> : null}
    </div>
  );
}
