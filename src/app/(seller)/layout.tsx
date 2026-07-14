import { AppShell } from "@/components/layout/app-shell";
import { sellerNav } from "@/lib/constants";
import type { ReactNode } from "react";

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell title="Seller Panel" nav={sellerNav}>
      {children}
    </AppShell>
  );
}
