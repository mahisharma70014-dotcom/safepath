import { AppShell } from "@/components/layout/app-shell";
import { adminNav } from "@/lib/constants";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell title="Admin Panel" nav={adminNav}>
      {children}
    </AppShell>
  );
}
