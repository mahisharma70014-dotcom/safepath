"use client";

import { cn } from "@/lib/utils";
import { clearSession } from "@/lib/auth";
import {
  Bell,
  CircleDollarSign,
  CreditCard,
  FileCheck2,
  HelpCircle,
  History,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Bell,
  CircleDollarSign,
  CreditCard,
  FileCheck2,
  HelpCircle,
  History,
  LayoutDashboard,
  ListOrdered,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  Wallet,
};

type NavItem = {
  name: string;
  href: string;
  icon: string;
};

type AppShellProps = {
  title: string;
  nav: NavItem[];
  children: ReactNode;
};

export function AppShell({ title, nav, children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="panel-bg min-h-screen text-slate-100">
      <div className="mx-auto flex max-w-[1600px]">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 transform border-r border-cyan-900/40 bg-[#040d1d]/90 p-5 backdrop-blur-xl transition-transform lg:static lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-wide text-cyan-100">{title}</h1>
            <button
              className="rounded-md border border-cyan-800/40 p-1 lg:hidden"
              onClick={() => setOpen(false)}
            >
              <Menu size={18} />
            </button>
          </div>
          <nav className="space-y-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              const Icon = iconMap[item.icon] ?? LayoutDashboard;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-cyan-500/18 text-cyan-100"
                      : "text-slate-300 hover:bg-cyan-500/8 hover:text-cyan-50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-h-screen w-full lg:pl-0">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-cyan-900/35 bg-[#030c1a]/85 px-4 py-3 backdrop-blur-xl md:px-8">
            <div className="flex items-center gap-3">
              <button
                className="rounded-md border border-cyan-800/40 p-1 lg:hidden"
                onClick={() => setOpen((prev) => !prev)}
              >
                <Menu size={18} />
              </button>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  className="input-base w-52 pl-9 md:w-80"
                  placeholder="Search orders, users, tickets..."
                />
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button className="btn-ghost p-2">
                <Bell size={16} />
              </button>
              <button
                className="btn-ghost flex items-center gap-2 px-3 py-2 text-sm"
                onClick={() => {
                  clearSession();
                  router.push("/login");
                }}
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </header>

          <main className="space-y-6 px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
