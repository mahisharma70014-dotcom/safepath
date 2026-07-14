"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { getSession } from "@/lib/auth";
import { getWalletState } from "@/lib/system-data";
import { useEffect, useState } from "react";

export default function WalletPage() {
  const [wallet, setWallet] = useState(getWalletState("seller@company.com"));

  useEffect(() => {
    const session = getSession();
    const email = session?.email ?? "seller@company.com";
    setWallet(getWalletState(email));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Wallet Balance</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <PanelCard title="Available Balance">
          <p className="text-2xl font-semibold">{wallet.availableUsdt.toLocaleString("en-IN")} USDT</p>
        </PanelCard>
        <PanelCard title="Locked in Orders">
          <p className="text-2xl font-semibold">{wallet.lockedUsdt.toLocaleString("en-IN")} USDT</p>
        </PanelCard>
        <PanelCard title="Last Settlement / Deposit">
          <p className="text-2xl font-semibold">INR {wallet.lastSettlementInr.toLocaleString("en-IN")}</p>
          <p className="mt-2 text-sm text-cyan-300">Last deposit: {wallet.lastDepositUsdt} USDT</p>
        </PanelCard>
      </div>
    </div>
  );
}
