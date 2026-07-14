export type NetworkType = "TRC20" | "BEP20" | "ERC20";
export type TransactionStatus = "Pending" | "Processing" | "Completed" | "Rejected";
export type PaymentMethod = "UPI" | "CDM" | "Mix";

export type DepositSettings = {
  qrCodeDataUrl: string;
  walletAddress: string;
  network: NetworkType;
  walletLabel: string;
  enabled: boolean;
  updatedAt?: string;
};

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
  updatedAt?: string;
};

export type WalletRecord = {
  userId: string;
  availableUsdt: number;
  lockedUsdt: number;
  lastSettlementInr: number;
  lastDepositUsdt: number;
  updatedAt?: string;
  createdAt?: string;
};

export type RequestRecord = {
  id: string;
  userId: string;
  userEmail: string;
  type: "deposit" | "sell" | "withdraw";
  amountUsdt: number;
  network: NetworkType;
  status: TransactionStatus;
  createdAt: string;
  updatedAt?: string;
  walletAddress?: string;
  screenshotName?: string;
  screenshotDataUrl?: string;
  paymentMethod?: PaymentMethod;
  rate?: number;
  estimatedInr?: number;
  payoutDetails?: string;
  destinationWallet?: string;
};

export type UserRecord = {
  uid: string;
  email: string;
  fullName: string;
  phone?: string;
  role: "seller" | "admin";
  kycStatus?: "pending" | "submitted" | "approved" | "rejected";
  banned?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SupportTicketStatus = "Open" | "In Progress" | "Resolved";

export type SupportTicket = {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  category: "Order issue" | "Wallet issue" | "KYC issue" | "Account security";
  message: string;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt?: string;
};

export const defaultDepositSettings: DepositSettings = {
  qrCodeDataUrl: "/image/bep20.png",
  walletAddress: "0x997700b3bFf8f9F0e963609AD290962116e9FA77",
  network: "BEP20",
  walletLabel: "Primary Treasury Wallet (BEP20)",
  enabled: true,
};

export const defaultSellSettings: SellSettings = {
  upiRate: 87.2,
  cdmRate: 87.05,
  mixRate: 86.95,
  bankName: "",
  accountHolder: "",
  accountNumber: "",
  ifsc: "",
  upiId: "",
  upiHolder: "",
};
