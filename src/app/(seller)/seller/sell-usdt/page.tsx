"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { StatusPill } from "@/components/ui/status-pill";
import { Toast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";
import {
  getPaymentDetailsLabel,
  getPaymentRate,
  getSellSettings,
  getWalletState,
  PaymentMethod,
  submitSellRequest,
} from "@/lib/system-data";
import { useEffect, useMemo, useState } from "react";

export default function SellUsdtPage() {
  const [availableUsdt, setAvailableUsdt] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [amount, setAmount] = useState(1000);
  const [network, setNetwork] = useState<"TRC20" | "BEP20" | "ERC20">("TRC20");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState(getSellSettings());

  useEffect(() => {
    const session = getSession();
    const email = session?.email ?? "seller@company.com";
    setAvailableUsdt(getWalletState(email).availableUsdt);
    setSettings(getSellSettings());
  }, []);

  const rate = useMemo(() => getPaymentRate(paymentMethod, settings), [paymentMethod, settings]);
  const payout = useMemo(() => amount * rate, [amount, rate]);
  const paymentDetails = useMemo(
    () => getPaymentDetailsLabel(paymentMethod, settings),
    [paymentMethod, settings],
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Sell USDT</h2>

      <PanelCard title="Create Sell Order" subtitle="Submit and track your sell request">
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();

            const session = getSession();
            const email = session?.email ?? "seller@company.com";

            if (amount <= 0) {
              setError("Enter a valid sell amount.");
              return;
            }

            if (amount > availableUsdt) {
              setError("Available balance se zyada sell order allow nahi hai.");
              return;
            }

            try {
              submitSellRequest({
                userEmail: email,
                amountUsdt: amount,
                network,
                paymentMethod,
                rate,
                estimatedInr: payout,
                payoutDetails: paymentDetails,
              });
              setAvailableUsdt(getWalletState(email).availableUsdt);
              setError("");
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : "Unable to create sell order.");
              return;
            }

            setSubmitted(true);
          }}
        >
          <div>
            <label className="mb-1 block text-sm text-slate-300">1) Enter USDT Amount</label>
            <input
              className="input-base"
              type="number"
              min={1}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value || 0))}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">2) Select Network</label>
            <select
              className="input-base"
              value={network}
              onChange={(event) =>
                setNetwork(event.target.value as "TRC20" | "BEP20" | "ERC20")
              }
            >
              <option value="TRC20">TRC20</option>
              <option value="BEP20">BEP20</option>
              <option value="ERC20">ERC20</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">3) Payment Method</label>
            <select
              className="input-base"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
            >
              <option value="UPI">UPI</option>
              <option value="CDM">CDM</option>
              <option value="Mix">Mix</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">4) Admin Rate</label>
            <div className="input-base">1 USDT = INR {rate}</div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Estimated Payout</label>
            <div className="input-base">INR {payout.toLocaleString("en-IN")}</div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Available Balance</label>
            <div className="input-base">{availableUsdt.toLocaleString("en-IN")} USDT</div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-slate-300">5) Admin Configured Payment Details</label>
            <div className="input-base min-h-24">{paymentDetails}</div>
          </div>

          {error ? <p className="md:col-span-2 text-sm text-rose-300">{error}</p> : null}

          <button className="btn-primary md:col-span-2 py-3 font-semibold">
            6) Submit Sell Request
          </button>
        </form>
      </PanelCard>

      <PanelCard title="6) Track Order Status">
        <div className="flex flex-wrap gap-2">
          <StatusPill status="Pending" />
          <StatusPill status="Processing" />
          <StatusPill status="Completed" />
          <StatusPill status="Cancelled" />
        </div>
      </PanelCard>

      {submitted ? (
        <Toast message="Sell request submitted successfully. You can monitor status in Active Orders." type="success" />
      ) : null}
    </div>
  );
}
