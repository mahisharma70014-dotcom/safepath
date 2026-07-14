import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-16 right-1/4 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <main className="glass-card relative z-10 w-full max-w-5xl rounded-3xl p-8 md:p-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <section className="space-y-5">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/90">SafePath DT Panel</p>
            <h1 className="text-4xl font-semibold leading-tight text-slate-50 md:text-5xl">
              Secure USDT Seller and Admin Operations
            </h1>
            <p className="max-w-xl text-slate-300">
              Premium fintech dashboard with secure authentication, KYC management, sell order workflows,
              analytics, and real-time operational visibility.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="btn-primary px-5 py-3 font-semibold">
                Open Login
              </Link>
              <Link href="/register" className="btn-ghost px-5 py-3 font-semibold">
                Create Seller Account
              </Link>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            {[
              "Dashboard Overview",
              "Wallet & Orders",
              "Sell USDT Flow",
              "KYC + Security",
              "Notifications",
              "Admin Analytics",
            ].map((item) => (
              <div key={item} className="rounded-xl border border-cyan-800/40 bg-cyan-500/5 px-4 py-3 text-sm text-slate-200">
                {item}
              </div>
            ))}
            <Link href="/seller/dashboard" className="btn-ghost rounded-xl px-4 py-3 text-center text-sm font-medium">
              Seller Panel Preview
            </Link>
            <Link href="/admin/dashboard" className="btn-ghost rounded-xl px-4 py-3 text-center text-sm font-medium">
              Admin Panel Preview
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
