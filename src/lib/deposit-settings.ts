export type DepositNetwork = "TRC20" | "BEP20" | "ERC20";

export type DepositSettings = {
  qrCodeDataUrl: string;
  walletAddress: string;
  network: DepositNetwork;
  walletLabel: string;
  enabled: boolean;
};

const SETTINGS_KEY = "safepath_deposit_settings";

export const defaultDepositSettings: DepositSettings = {
  qrCodeDataUrl: "",
  walletAddress: "TQmSafepathDemoWalletAddress0001",
  network: "TRC20",
  walletLabel: "Primary Treasury Wallet",
  enabled: true,
};

const canUseStorage = () => typeof window !== "undefined";

export const getDepositSettings = (): DepositSettings => {
  if (!canUseStorage()) return defaultDepositSettings;

  const raw = window.localStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultDepositSettings;

  try {
    const parsed = JSON.parse(raw) as Partial<DepositSettings>;
    return {
      ...defaultDepositSettings,
      ...parsed,
    };
  } catch {
    return defaultDepositSettings;
  }
};

export const saveDepositSettings = (settings: DepositSettings): void => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
