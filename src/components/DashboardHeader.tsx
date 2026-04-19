"use client";
import { motion } from "framer-motion";
import { RefreshCw, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WatchedSite } from "@/types";

interface DashboardHeaderProps {
  sites: WatchedSite[];
  onScrapeAll: () => void;
  isScraping: boolean;
}

export function DashboardHeader({ sites, onScrapeAll, isScraping }: DashboardHeaderProps) {
  const changedCount = sites.filter((s) => s.status === "changed").length;
  const errorCount = sites.filter((s) => s.status === "error").length;
  const okCount = sites.filter((s) => s.status === "ok").length;

  return (
    <div className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-violet-600/20 border border-violet-500/30">
              <Activity className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-zinc-100 leading-tight">
                Web<span className="text-gradient">Watch</span>
              </h1>
              <p className="text-xs text-zinc-500">Monitoring intelligent</p>
            </div>
          </div>

          {sites.length > 0 && (
            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="hidden sm:flex items-center gap-3 text-xs">
                {okCount > 0 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1.5 text-green-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    {okCount} stable{okCount > 1 ? "s" : ""}
                  </motion.span>
                )}
                {changedCount > 0 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1.5 text-violet-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                    {changedCount} modifié{changedCount > 1 ? "s" : ""}
                  </motion.span>
                )}
                {errorCount > 0 && (
                  <span className="flex items-center gap-1.5 text-red-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    {errorCount} erreur{errorCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={onScrapeAll}
                disabled={isScraping}
                className="gap-2 h-8 text-xs"
              >
                <RefreshCw className={`h-3 w-3 ${isScraping ? "animate-spin" : ""}`} />
                Tout vérifier
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
