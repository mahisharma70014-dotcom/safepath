import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -left-16 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute -right-10 top-28 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
