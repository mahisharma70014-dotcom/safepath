"use client";

import { useEffect, useState } from "react";

export function usePollingJson<T>(url: string, intervalMs = 4000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const load = async () => {
      try {
        const response = await fetch(url, { cache: "no-store", credentials: "include" });
        const payload = (await response.json()) as T & { message?: string };
        if (!mounted) return;
        if (!response.ok) {
          setError(payload.message ?? "Unable to load resource.");
          setLoading(false);
          return;
        }
        setData(payload);
        setError("");
        setLoading(false);
      } catch (nextError) {
        if (!mounted) return;
        setError(nextError instanceof Error ? nextError.message : "Unable to load resource.");
        setLoading(false);
      }
    };

    void load();
    timer = setInterval(() => {
      void load();
    }, intervalMs);

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [url, intervalMs]);

  return { data, loading, error, refresh: () => fetch(url, { cache: "no-store", credentials: "include" }).then((res) => res.json()).then((payload) => setData(payload)) };
}
