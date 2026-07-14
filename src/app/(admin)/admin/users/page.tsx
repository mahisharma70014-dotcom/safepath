"use client";

import { PanelCard } from "@/components/ui/panel-card";
import { usePollingJson } from "@/hooks/use-polling-json";
import { useState } from "react";

type AdminUser = {
  uid: string;
  email: string;
  fullName: string;
  role: "seller" | "admin";
  phone?: string;
  kycStatus?: "pending" | "submitted" | "approved" | "rejected";
  banned?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function AdminUsersPage() {
  const { data, refresh } = usePollingJson<{ users: AdminUser[] }>('/api/users', 5000);
  const [savingUser, setSavingUser] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const users = data?.users ?? [];

  const handleAction = async (userId: string, payload: Record<string, unknown>) => {
    setSavingUser(userId);
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.message || 'Unable to update user.');
    } else {
      setMessage('User updated successfully.');
      await refresh();
    }
    setSavingUser(null);
    window.setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">User Management</h2>
      <PanelCard title="Registered Users" subtitle="Real users from Firestore">
        <div className="overflow-x-auto rounded-xl border border-cyan-800/30">
          <table className="min-w-full text-sm">
            <thead className="bg-[#071830] text-left text-slate-300">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">KYC</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length ? users.map((user) => (
                <tr key={user.uid} className="border-t border-cyan-900/20 text-slate-200">
                  <td className="px-4 py-3">{user.fullName || "-"}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.phone || "-"}</td>
                  <td className="px-4 py-3 uppercase">{user.role}</td>
                  <td className="px-4 py-3 uppercase">{user.kycStatus || 'pending'}</td>
                  <td className="px-4 py-3">{user.banned ? 'Blocked' : 'Active'}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      className="btn-secondary btn-sm"
                      disabled={savingUser === user.uid}
                      onClick={() => handleAction(user.uid, { banned: !user.banned })}
                    >
                      {user.banned ? 'Unblock' : 'Block'}
                    </button>
                    {user.role === 'seller' ? (
                      <button
                        className="btn-secondary btn-sm"
                        disabled={savingUser === user.uid}
                        onClick={() => handleAction(user.uid, { role: 'admin' })}
                      >
                        Promote
                      </button>
                    ) : (
                      <button
                        className="btn-secondary btn-sm"
                        disabled={savingUser === user.uid}
                        onClick={() => handleAction(user.uid, { role: 'seller' })}
                      >
                        Demote
                      </button>
                    )}
                    <button
                      className="btn-secondary btn-sm"
                      disabled={savingUser === user.uid}
                      onClick={() => handleAction(user.uid, { kycStatus: 'approved' })}
                    >
                      Approve KYC
                    </button>
                  </td>
                </tr>
              )) : (
                <tr className="border-t border-cyan-900/20 text-cyan-400">
                  <td className="px-4 py-3" colSpan={7}>No real users found yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>
      {message ? <div className="rounded-xl border border-cyan-700/40 bg-cyan-500/10 p-3 text-cyan-100">{message}</div> : null}
    </div>
  );
}
