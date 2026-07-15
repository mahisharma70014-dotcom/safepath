import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types";

const statusMap: Record<OrderStatus, string> = {
  Pending: "bg-amber-300/15 text-amber-200 border-amber-300/40",
  Processing: "bg-sky-300/15 text-sky-200 border-sky-300/40",
  Completed: "bg-emerald-300/15 text-emerald-200 border-emerald-300/40",
  Approved: "bg-emerald-300/15 text-emerald-200 border-emerald-300/40",
  Cancelled: "bg-rose-300/15 text-rose-200 border-rose-300/40",
  Rejected: "bg-rose-300/15 text-rose-200 border-rose-300/40",
};

export function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
        statusMap[status],
      )}
    >
      {status}
    </span>
  );
}
