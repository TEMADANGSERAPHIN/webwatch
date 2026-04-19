"use client";
import { useState, useEffect, useCallback } from "react";
import { WatchedSite } from "@/types";

export function useSites() {
  const [sites, setSites] = useState<WatchedSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSites = useCallback(async () => {
    try {
      const res = await fetch("/api/urls");
      const json = await res.json();
      if (json.success) setSites(json.data);
      else setError(json.error);
    } catch {
      setError("Impossible de charger les sites");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  const addSite = useCallback(async (url: string, label?: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, label }),
      });
      const json = await res.json();
      if (json.success) {
        setSites((prev) => [json.data, ...prev]);
        return true;
      }
      setError(json.error);
      return false;
    } catch {
      setError("Erreur lors de l'ajout");
      return false;
    }
  }, []);

  const deleteSite = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/urls/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setSites((prev) => prev.filter((s) => s.id !== id));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const scrapeSite = useCallback(async (siteId: string): Promise<{ hasChanges: boolean; summary: string } | null> => {
    setSites((prev) =>
      prev.map((s) => (s.id === siteId ? { ...s, status: "checking" as const } : s))
    );
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      const json = await res.json();
      if (json.success) {
        const { hasChanges, checkedAt } = json.data;
        setSites((prev) =>
          prev.map((s) =>
            s.id === siteId
              ? {
                  ...s,
                  status: hasChanges ? ("changed" as const) : ("ok" as const),
                  lastChecked: checkedAt,
                  lastChange: hasChanges ? checkedAt : s.lastChange,
                }
              : s
          )
        );
        return { hasChanges: json.data.hasChanges, summary: json.data.summary };
      }
      setSites((prev) =>
        prev.map((s) => (s.id === siteId ? { ...s, status: "error" as const } : s))
      );
      return null;
    } catch {
      setSites((prev) =>
        prev.map((s) => (s.id === siteId ? { ...s, status: "error" as const } : s))
      );
      return null;
    }
  }, []);

  const scrapeAll = useCallback(async () => {
    const pending = sites.filter((s) => s.status !== "checking");
    await Promise.allSettled(pending.map((s) => scrapeSite(s.id)));
  }, [sites, scrapeSite]);

  return { sites, loading, error, addSite, deleteSite, scrapeSite, scrapeAll, refetch: fetchSites };
}
