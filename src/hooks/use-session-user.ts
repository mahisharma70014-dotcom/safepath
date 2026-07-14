"use client";

import type { SessionUser } from "@/lib/auth";
import { useEffect, useState } from "react";

export function useSessionUser() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!mounted) return;
        if (!response.ok) {
          setUser(null);
          setLoading(false);
          return;
        }

        const data = (await response.json()) as { user: SessionUser | null };
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setUser(null);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { user, loading };
}