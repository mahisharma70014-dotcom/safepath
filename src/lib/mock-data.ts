import { DashboardMetric, SellerOrder } from "@/types";

export const sellerMetrics: DashboardMetric[] = [
  { label: "Wallet Balance", value: "$24,580.40", trend: "+8.4%" },
  { label: "USDT Sold Today", value: "12,950 USDT", trend: "+5.1%" },
  { label: "Active Orders", value: "18", trend: "-2" },
  { label: "Pending Payout", value: "$3,940.00", trend: "+1.2%" },
];

export const orders: SellerOrder[] = [
  {
    id: "SPO-24391",
    amountUsdt: 1800,
    network: "TRC20",
    rate: 87.21,
    status: "Processing",
    createdAt: "2026-07-13 14:21",
  },
  {
    id: "SPO-24384",
    amountUsdt: 600,
    network: "BEP20",
    rate: 87.05,
    status: "Completed",
    createdAt: "2026-07-13 09:05",
  },
  {
    id: "SPO-24380",
    amountUsdt: 2500,
    network: "ERC20",
    rate: 86.98,
    status: "Pending",
    createdAt: "2026-07-12 21:47",
  },
];

export const adminMetrics: DashboardMetric[] = [
  { label: "Total Users", value: "48,390", trend: "+6.2%" },
  { label: "Verified Users", value: "39,214", trend: "+4.8%" },
  { label: "Pending KYC", value: "528", trend: "-3.1%" },
  { label: "Revenue (30d)", value: "$1.28M", trend: "+12.7%" },
];
