"use client";
import { useState, useEffect, useCallback } from "react";
import { Change, WatchedSite, Snapshot } from "@/types";

interface SiteHistory {
  site: WatchedSite;
  changes: Change[];
  snapshots: Snapshot[];
}

export function useHistory(siteId: string | null) {
  const [history, setHistory] = useState<SiteHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/history/${id}`);
      const json = await res.json();
      if (json.success) setHistory(json.data);
      else setError(json.error);
    } catch {
      setError("Impossible de charger l'historique");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (siteId) fetchHistory(siteId);
    else setHistory(null);
  }, [siteId, fetchHistory]);

  return { history, loading, error, refetch: siteId ? () => fetchHistory(siteId) : undefined };
}
