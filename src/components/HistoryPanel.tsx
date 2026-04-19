"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Sparkles, AlertTriangle, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/StatusDot";
import { useHistory } from "@/hooks/useHistory";
import { formatDate, formatRelativeTime, getDomain } from "@/lib/utils";
import { Change } from "@/types";

interface HistoryPanelProps {
  siteId: string | null;
  onClose: () => void;
}

function ChangeItem({ change, index }: { change: Change; index: number }) {
  const isFirst = index === 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative flex gap-4"
    >
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
          change.hasChanges
            ? "border-violet-500/40 bg-violet-500/10"
            : "border-zinc-700/50 bg-zinc-800/50"
        }`}>
          {change.hasChanges ? (
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          ) : (
            <CheckCircle className="h-3.5 w-3.5 text-zinc-500" />
          )}
        </div>
        {!isFirst && <div className="mt-1 flex-1 w-px bg-zinc-800/60 min-h-[20px]" />}
      </div>

      {/* Content */}
      <div className="pb-5 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-medium text-zinc-300">
            {change.hasChanges ? "Changement détecté" : "Aucun changement"}
          </span>
          <span className="text-xs text-zinc-600">{formatRelativeTime(change.detectedAt)}</span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-800/40 rounded-lg p-3 border border-zinc-700/30">
          {change.summary}
        </p>
        <p className="text-xs text-zinc-600 mt-1.5">{formatDate(change.detectedAt)}</p>
      </div>
    </motion.div>
  );
}

export function HistoryPanel({ siteId, onClose }: HistoryPanelProps) {
  const { history, loading, error } = useHistory(siteId);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {siteId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-zinc-800/60">
              <div>
                {history ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusDot status={history.site.status} />
                      <h2 className="font-semibold text-zinc-100 text-base">{history.site.label}</h2>
                    </div>
                    <a
                      href={history.site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-violet-400 transition-colors font-mono"
                    >
                      {getDomain(history.site.url)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </>
                ) : (
                  <div className="h-5 w-40 bg-zinc-800 rounded animate-pulse" />
                )}
              </div>
              <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 -mt-1 -mr-1">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Stats row */}
            {history && (
              <div className="grid grid-cols-3 gap-px bg-zinc-800/40 border-b border-zinc-800/60">
                {[
                  { label: "Vérifications", value: history.changes.length },
                  { label: "Changements", value: history.changes.filter((c) => c.hasChanges).length },
                  { label: "Snapshots", value: history.snapshots.length },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-zinc-950 px-4 py-3 text-center">
                    <p className="text-xl font-semibold text-zinc-100">{value}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-5">
              {loading && (
                <div className="flex flex-col items-center justify-center h-32 gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
                  <p className="text-sm text-zinc-500">Chargement de l'historique...</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-950/30 border border-red-900/40 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {!loading && !error && history && (
                <>
                  {history.changes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-2 text-center">
                      <Clock className="h-8 w-8 text-zinc-700" />
                      <p className="text-sm text-zinc-500">Aucun historique disponible.</p>
                      <p className="text-xs text-zinc-600">Lancez une vérification pour démarrer.</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-zinc-600 uppercase tracking-wide font-medium mb-4">
                        Historique des vérifications
                      </p>
                      <div className="space-y-0">
                        {history.changes.map((change, i) => (
                          <ChangeItem key={change.id} change={change} index={i} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
