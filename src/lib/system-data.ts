export type TransactionStatus = "Pending" | "Processing" | "Completed" | "Rejected";

export type PaymentMethod = "UPI" | "CDM" | "Mix";

export type SellSettings = {
  upiRate: number;
  cdmRate: number;
  mixRate: number;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
  upiHolder: string;
};

export type WalletState = {
  availableUsdt: number;
  lockedUsdt: number;
  lastSettlementInr: number;
  lastDepositUsdt: number;
};

export type BaseRequest = {
  id: string;
  userEmail: string;
  type: "deposit" | "sell" | "withdraw";
  amountUsdt: number;
  network: "TRC20" | "BEP20" | "ERC20";
  status: TransactionStatus;
  createdAt: string;
};

export type DepositRequest = BaseRequest & {
  type: "deposit";
  walletAddress: string;
  screenshotName: string;
};

export type SellRequest = BaseRequest & {
  type: "sell";
  paymentMethod: PaymentMethod;
  rate: number;
  estimatedInr: number;
  payoutDetails: string;
};

export type WithdrawRequest = BaseRequest & {
  type: "withdraw";
  destinationWallet: string;
};

export type SystemRequest = DepositRequest | SellRequest | WithdrawRequest;

const SELL_SETTINGS_KEY = "safepath_sell_settings";
const REQUESTS_KEY = "safepath_requests";
const WALLETS_KEY = "safepath_wallets";

export const defaultSellSettings: SellSettings = {
  upiRate: 87.2,
  cdmRate: 87.05,
  mixRate: 86.95,
  bankName: "HDFC Bank",
  accountHolder: "SafePath Technologies Pvt Ltd",
  accountNumber: "50200012998761",
  ifsc: "HDFC0001021",
  upiId: "safepath.pay@hdfc",
  upiHolder: "SafePath Treasury",
};

const defaultWallets: Record<string, WalletState> = {
  "seller@company.com": {
    availableUsdt: 5000,
    lockedUsdt: 0,
    lastSettlementInr: 0,
    lastDepositUsdt: 0,
  },
};

const canUseStorage = () => typeof window !== "undefined";

const makeId = (prefix: string) => `${prefix}-${Date.now().toString().slice(-8)}`;

const now = () => new Date().toLocaleString("en-IN", { hour12: false });

export const getSellSettings = (): SellSettings => {
  if (!canUseStorage()) return defaultSellSettings;
  const raw = window.localStorage.getItem(SELL_SETTINGS_KEY);
  if (!raw) return defaultSellSettings;

  try {
    return { ...defaultSellSettings, ...(JSON.parse(raw) as Partial<SellSettings>) };
  } catch {
    return defaultSellSettings;
  }
};

export const saveSellSettings = (settings: SellSettings): void => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SELL_SETTINGS_KEY, JSON.stringify(settings));
};

const getWalletMap = (): Record<string, WalletState> => {
  if (!canUseStorage()) return defaultWallets;
  const raw = window.localStorage.getItem(WALLETS_KEY);
  if (!raw) return defaultWallets;

  try {
    return { ...defaultWallets, ...(JSON.parse(raw) as Record<string, WalletState>) };
  } catch {
    return defaultWallets;
  }
};

const saveWalletMap = (wallets: Record<string, WalletState>): void => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(WALLETS_KEY, JSON.stringify(wallets));
};

export const getWalletState = (email: string): WalletState => {
  const wallets = getWalletMap();
  return (
    wallets[email] ?? {
      availableUsdt: 0,
      lockedUsdt: 0,
      lastSettlementInr: 0,
      lastDepositUsdt: 0,
    }
  );
};

const saveWalletState = (email: string, wallet: WalletState): void => {
  const wallets = getWalletMap();
  wallets[email] = wallet;
  saveWalletMap(wallets);
};

export const getRequests = (): SystemRequest[] => {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(REQUESTS_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as SystemRequest[];
  } catch {
    return [];
  }
};

const saveRequests = (requests: SystemRequest[]): void => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
};

export const submitDepositRequest = (input: Omit<DepositRequest, "id" | "status" | "createdAt" | "type">) => {
  const request: DepositRequest = {
    ...input,
    id: makeId("DEP"),
    type: "deposit",
    status: "Pending",
    createdAt: now(),
  };

  const requests = [request, ...getRequests()];
  saveRequests(requests);
  return request;
};

export const submitSellRequest = (
  input: Omit<SellRequest, "id" | "status" | "createdAt" | "type">,
) => {
  const wallet = getWalletState(input.userEmail);
  if (input.amountUsdt > wallet.availableUsdt) {
    throw new Error("Sell amount exceeds available USDT balance.");
  }

  saveWalletState(input.userEmail, {
    ...wallet,
    availableUsdt: wallet.availableUsdt - input.amountUsdt,
    lockedUsdt: wallet.lockedUsdt + input.amountUsdt,
  });

  const request: SellRequest = {
    ...input,
    id: makeId("SEL"),
    type: "sell",
    status: "Pending",
    createdAt: now(),
  };

  const requests = [request, ...getRequests()];
  saveRequests(requests);
  return request;
};

export const submitWithdrawRequest = (
  input: Omit<WithdrawRequest, "id" | "status" | "createdAt" | "type">,
) => {
  const wallet = getWalletState(input.userEmail);
  if (input.amountUsdt > wallet.availableUsdt) {
    throw new Error("Withdraw amount exceeds available USDT balance.");
  }

  saveWalletState(input.userEmail, {
    ...wallet,
    availableUsdt: wallet.availableUsdt - input.amountUsdt,
    lockedUsdt: wallet.lockedUsdt + input.amountUsdt,
  });

  const request: WithdrawRequest = {
    ...input,
    id: makeId("WDR"),
    type: "withdraw",
    status: "Pending",
    createdAt: now(),
  };

  const requests = [request, ...getRequests()];
  saveRequests(requests);
  return request;
};

export const updateRequestStatus = (id: string, status: TransactionStatus): SystemRequest[] => {
  const requests = getRequests();
  const target = requests.find((item) => item.id === id);
  if (!target) return requests;

  const previousStatus = target.status;
  if (previousStatus === status) return requests;

  const wallet = getWalletState(target.userEmail);

  if (target.type === "deposit" && status === "Completed" && previousStatus !== "Completed") {
    saveWalletState(target.userEmail, {
      ...wallet,
      availableUsdt: wallet.availableUsdt + target.amountUsdt,
      lastDepositUsdt: target.amountUsdt,
    });
  }

  if (target.type === "sell") {
    if (status === "Rejected" && previousStatus !== "Rejected") {
      saveWalletState(target.userEmail, {
        ...wallet,
        availableUsdt: wallet.availableUsdt + target.amountUsdt,
        lockedUsdt: Math.max(0, wallet.lockedUsdt - target.amountUsdt),
      });
    }

    if (status === "Completed" && previousStatus !== "Completed") {
      saveWalletState(target.userEmail, {
        ...wallet,
        lockedUsdt: Math.max(0, wallet.lockedUsdt - target.amountUsdt),
        lastSettlementInr: target.estimatedInr,
      });
    }
  }

  if (target.type === "withdraw") {
    if (status === "Rejected" && previousStatus !== "Rejected") {
      saveWalletState(target.userEmail, {
        ...wallet,
        availableUsdt: wallet.availableUsdt + target.amountUsdt,
        lockedUsdt: Math.max(0, wallet.lockedUsdt - target.amountUsdt),
      });
    }

    if (status === "Completed" && previousStatus !== "Completed") {
      saveWalletState(target.userEmail, {
        ...wallet,
        lockedUsdt: Math.max(0, wallet.lockedUsdt - target.amountUsdt),
      });
    }
  }

  const updated = requests.map((item) => (item.id === id ? { ...item, status } : item));
  saveRequests(updated);
  return updated;
};

export const getUserRequests = (email: string) => getRequests().filter((item) => item.userEmail === email);

export const getPaymentRate = (method: PaymentMethod, settings: SellSettings) => {
  if (method === "UPI") return settings.upiRate;
  if (method === "CDM") return settings.cdmRate;
  return settings.mixRate;
};

export const getPaymentDetailsLabel = (method: PaymentMethod, settings: SellSettings) => {
  if (method === "UPI") {
    return `UPI ID: ${settings.upiId} | Holder: ${settings.upiHolder}`;
  }

  if (method === "CDM") {
    return `Bank: ${settings.bankName} | A/C: ${settings.accountNumber} | IFSC: ${settings.ifsc}`;
  }

  return `UPI: ${settings.upiId} | Bank A/C: ${settings.accountNumber}`;
};