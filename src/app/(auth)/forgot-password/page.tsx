"use client";

import { Toast } from "@/components/ui/toast";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const isBusinessEmail = (email: string) => {
    const normalized = email.trim().toLowerCase();
    const blockedDomains = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "icloud.com",
      "aol.com",
      "proton.me",
      "protonmail.com",
    ];

    const [, domain] = normalized.split("@");
    if (!domain) return false;
    return !blockedDomains.includes(domain);
  };

  return (
    <div className="glass-card animate-rise rounded-3xl p-6 sm:p-8">
      <h1 className="text-3xl font-semibold text-slate-50">Reset Password</h1>
      <p className="mt-2 text-sm text-slate-400">
        Enter your account email. We will send a secure reset link.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();

          const formData = new FormData(event.currentTarget);
          const email = String(formData.get("email") ?? "");

          if (!isBusinessEmail(email)) {
            setSent(false);
            setError("Password reset is allowed only with company email.");
            return;
          }

          setError("");
          setSent(true);
        }}
      >
        <input
          name="email"
          className="input-base"
          type="email"
          placeholder="name@company.com"
          required
        />
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button className="btn-primary w-full py-3 font-semibold">Send Reset Instructions</button>
      </form>

      <p className="mt-5 text-sm text-slate-400">
        Back to{" "}
        <Link href="/login" className="text-cyan-300 hover:text-cyan-100">
          Login
        </Link>
      </p>

      {sent ? <Toast type="info" message="Recovery email sent." /> : null}
    </div>
  );
}
