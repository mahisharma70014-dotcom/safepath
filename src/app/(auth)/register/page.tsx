"use client";

import { getUsers, isCompanyEmail, saveUser } from "@/lib/auth";
import { Toast } from "@/components/ui/toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [toast, setToast] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="glass-card animate-rise rounded-3xl p-6 sm:p-8">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">SafePath DT Panel</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-50">Create Account</h1>
        <p className="mt-2 text-sm text-slate-400">Register with email and secure your seller profile</p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();

          const formData = new FormData(event.currentTarget);
          const fullName = String(formData.get("fullName") ?? "").trim();
          const email = String(formData.get("email") ?? "").trim().toLowerCase();
          const phone = String(formData.get("phone") ?? "").trim();
          const password = String(formData.get("password") ?? "");
          const confirmPassword = String(formData.get("confirmPassword") ?? "");

          if (!isCompanyEmail(email)) {
            setError("Use company email only for registration.");
            setToast(false);
            return;
          }

          if (password !== confirmPassword) {
            setError("Password and confirm password must match.");
            setToast(false);
            return;
          }

          const exists = getUsers().some((user) => user.email.toLowerCase() === email);
          if (exists) {
            setError("This email is already registered.");
            setToast(false);
            return;
          }

          saveUser({
            fullName,
            email,
            phone,
            password,
            role: "seller",
          });

          setError("");
          setToast(true);
          setTimeout(() => router.push("/login"), 600);
        }}
      >
        <input name="fullName" className="input-base" placeholder="Full Name" required />
        <input name="email" type="email" className="input-base" placeholder="Business Email" required />
        <input name="phone" type="tel" className="input-base" placeholder="Phone Number" required />
        <input name="password" type="password" className="input-base" placeholder="Create Password" required />
        <input
          name="confirmPassword"
          type="password"
          className="input-base"
          placeholder="Confirm Password"
          required
        />

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <label className="flex items-start gap-2 text-sm text-slate-300">
          <input type="checkbox" className="mt-1 h-4 w-4 rounded" required />
          I agree to terms, privacy, and session management policy.
        </label>

        <button type="submit" className="btn-primary w-full py-3 font-semibold">
          Register Account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-cyan-300 hover:text-cyan-100">
          Go to login
        </Link>
      </p>

      {toast ? <Toast type="success" message="Registration successful. Redirecting to login..." /> : null}
    </div>
  );
}
