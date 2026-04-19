"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, RefreshCw, Trash2, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/StatusDot";
import { WatchedSite } from "@/types";
import { formatRelativeTime, getDomain, getStatusLabel } from "@/lib/utils";

interface SiteCardProps {
  site: WatchedSite;
  onScrape: (id: string) => Promise<{ hasChanges: boolean; summary: string } | null>;
  onDelete: (id: string) => Promise<boolean>;
  onViewHistory: (id: string) => void;
}

export function SiteCard({ site, onScrape, onDelete, onViewHistory }: SiteCardProps) {
  const [scraping, setScraping] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleScrape = async () => {
    setScraping(true);
    setShowResult(false);
    const result = await onScrape(site.id);
    setScraping(false);
    if (result) {
      setLastResult(result.summary);
      setShowResult(true);
      setTimeout(() => setShowResult(false), 8000);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return; }
    await onDelete(site.id);
  };

  const isChecking = site.status === "checking" || scraping;
  const domain = getDomain(site.url);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 hover:border-zinc-700/60 hover:bg-zinc-900/60 transition-all duration-200"
    >
      {/* Status glow accent */}
      {site.status === "changed" && (
        <div className="absolute inset-0 rounded-xl bg-violet-500/5 border border-violet-500/20 pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <StatusDot status={site.status} />
          <div className="min-w-0">
            <h3 className="font-medium text-zinc-100 truncate text-sm leading-tight">
              {site.label}
            </h3>
            <p className="text-xs text-zinc-500 truncate mt-0.5 font-mono">{domain}</p>
          </div>
        </div>
        <Badge variant={site.status as "ok" | "changed" | "error" | "checking" | "pending"}>
          {getStatusLabel(site.status)}
        </Badge>
      </div>

      {/* Last check info */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-600 mb-4">
        <Clock className="h-3 w-3" />
        <span>Vérifié {formatRelativeTime(site.lastChecked)}</span>
        {site.lastChange && (
          <>
            <span className="text-zinc-700">·</span>
            <span className="text-violet-500">Modifié {formatRelativeTime(site.lastChange)}</span>
          </>
        )}
      </div>

      {/* Last result preview */}
      <AnimatePresence>
        {showResult && lastResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <p className="text-xs text-zinc-400 bg-zinc-800/60 rounded-lg p-2.5 border border-zinc-700/40 leading-relaxed">
              {lastResult}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleScrape}
          disabled={isChecking}
          className="flex-1 h-8 text-xs"
        >
          <RefreshCw className={`h-3 w-3 ${isChecking ? "animate-spin" : ""}`} />
          {isChecking ? "Vérification..." : "Vérifier"}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => onViewHistory(site.id)}
          title="Voir l'historique"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          asChild
        >
          <a href={site.url} target="_blank" rel="noopener noreferrer" title="Ouvrir le site">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
        <Button
          size="icon"
          variant={confirmDelete ? "destructive" : "ghost"}
          className="h-8 w-8"
          onClick={handleDelete}
          title={confirmDelete ? "Cliquer pour confirmer" : "Supprimer"}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}
