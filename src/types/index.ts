export type OrderStatus = "Pending" | "Processing" | "Completed" | "Cancelled" | "Rejected";

export type SellerOrder = {
  id: string;
  amountUsdt: number;
  network: "TRC20" | "BEP20" | "ERC20";
  rate: number;
  status: OrderStatus;
  createdAt: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  trend?: string;
};
