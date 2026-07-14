"use client";

import { X } from "lucide-react";
import { useState } from "react";

export function Toast({
  message,
  type = "info",
}: {
  message: string;
  type?: "success" | "error" | "info";
}) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  const style =
    type === "success"
      ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-100"
      : type === "error"
        ? "border-rose-300/40 bg-rose-400/10 text-rose-100"
        : "border-cyan-300/40 bg-cyan-400/10 text-cyan-100";

  return (
    <div className={`glass-card fixed right-4 bottom-4 z-50 max-w-sm rounded-xl border px-4 py-3 ${style}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm">{message}</p>
        <button onClick={() => setOpen(false)} aria-label="Close toast">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
