"use client";

import { Toast } from "@/components/ui/toast";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="glass-card animate-rise rounded-3xl p-6 sm:p-8">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">SafePath DT Panel</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-50">Secure Login</h1>
        <p className="mt-2 text-sm text-slate-400">Access your seller or admin workspace</p>
      </div>

      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();

          const formData = new FormData(event.currentTarget);
          const email = String(formData.get("email") ?? "").trim();
          const password = String(formData.get("password") ?? "");

          if (!isFirebaseConfigured || !auth) {
            setError("Firebase authentication is not configured.");
            setShowToast(false);
            return;
          }

          try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await credential.user.getIdToken();

            const sessionResponse = await fetch("/api/auth/session", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ idToken }),
            });

            const payload = (await sessionResponse.json()) as {
              user?: { role: "seller" | "admin" };
              message?: string;
            };

            if (!sessionResponse.ok || !payload.user) {
              throw new Error(payload.message ?? "Unable to create secure session.");
            }

            setError("");
            setShowToast(true);

            const target = payload.user.role === "admin" ? "/admin/dashboard" : "/seller/dashboard";
            setTimeout(() => router.push(target), 500);
          } catch (loginError) {
            setError(loginError instanceof Error ? loginError.message : "Invalid email or password.");
            setShowToast(false);
          }
        }}
      >
        <div>
          <label className="mb-1 block text-sm text-slate-300">Email</label>
          <input name="email" type="email" className="input-base" placeholder="you@company.com" required />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Password</label>
          <input name="password" type="password" className="input-base" placeholder="Enter password" required />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-300">
            <input type="checkbox" className="h-4 w-4 rounded border-cyan-700 bg-transparent" disabled />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-cyan-300 hover:text-cyan-100">
            Forgot password?
          </Link>
        </div>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <button type="submit" className="btn-primary w-full py-3 font-semibold">
          Login Securely
        </button>
      </form>

      <div className="mt-6 space-y-3 text-center text-sm text-slate-400">
        <p>
          New seller?{" "}
          <Link href="/register" className="text-cyan-300 hover:text-cyan-100">
            Create account
          </Link>
        </p>
      </div>

      {showToast ? <Toast type="success" message="Login successful. Redirecting..." /> : null}
    </div>
  );
}
