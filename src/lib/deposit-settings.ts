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
  qrCodeDataUrl: "/image/bep20.png",
  walletAddress: "0x997700b3bFf8f9F0e963609AD290962116e9FA77",
  network: "BEP20",
  walletLabel: "Primary Treasury Wallet (BEP20)",
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
