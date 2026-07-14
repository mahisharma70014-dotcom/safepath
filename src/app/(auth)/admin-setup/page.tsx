"use client";

import { Toast } from "@/components/ui/toast";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminSetupPage() {
  const router = useRouter();
  const [toast, setToast] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="glass-card animate-rise rounded-3xl p-6 sm:p-8">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">SafePath DT Panel</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-50">Admin Setup</h1>
        <p className="mt-2 text-sm text-slate-400">Create your admin account</p>
      </div>

      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);

          const formData = new FormData(event.currentTarget);
          const setupKey = String(formData.get("setupKey") ?? "").trim();
          const email = String(formData.get("email") ?? "").trim().toLowerCase();
          const password = String(formData.get("password") ?? "");
          const confirmPassword = String(formData.get("confirmPassword") ?? "");
          const fullName = String(formData.get("fullName") ?? "").trim();

          if (!setupKey) {
            setError("Setup key is required.");
            setLoading(false);
            return;
          }

          if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
          }

          if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setLoading(false);
            return;
          }

          if (!isFirebaseConfigured || !auth) {
            setError("Firebase authentication is not configured.");
            setLoading(false);
            return;
          }

          try {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            const idToken = await credential.user.getIdToken();

            const setupResponse = await fetch("/api/admin/setup", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                setupKey,
                uid: credential.user.uid,
                email,
                fullName,
                adminPassword: password,
              }),
            });

            const payload = (await setupResponse.json()) as { message?: string };
            if (!setupResponse.ok) {
              throw new Error(payload.message ?? "Unable to setup admin.");
            }

            const sessionResponse = await fetch("/api/auth/session", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                idToken,
                fullName,
                roleHint: "admin",
              }),
            });

            if (!sessionResponse.ok) {
              throw new Error("Admin session could not be created.");
            }

            setError("");
            setToast(true);
            setTimeout(() => router.push("/admin/dashboard"), 600);
          } catch (setupError) {
            setError(
              setupError instanceof Error
                ? setupError.message
                : "Unable to setup admin account.",
            );
            setLoading(false);
          }
        }}
      >
        <input
          name="setupKey"
          type="password"
          className="input-base"
          placeholder="Setup Key"
          required
          disabled={loading}
        />
        <input
          name="fullName"
          className="input-base"
          placeholder="Full Name"
          required
          disabled={loading}
        />
        <input
          name="email"
          type="email"
          className="input-base"
          placeholder="Admin Email"
          required
          disabled={loading}
        />
        <input
          name="password"
          type="password"
          className="input-base"
          placeholder="Admin Password"
          required
          disabled={loading}
        />
        <input
          name="confirmPassword"
          type="password"
          className="input-base"
          placeholder="Confirm Password"
          required
          disabled={loading}
        />

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <button
          type="submit"
          className="btn-primary w-full py-3 font-semibold disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Setting up..." : "Create Admin"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Back to{" "}
        <a href="/login" className="text-cyan-300 hover:text-cyan-100">
          login
        </a>
      </p>

      {toast && <Toast message="Admin account created successfully!" />}
    </div>
  );
}
