"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSites } from "@/hooks/useSites";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SiteCard } from "@/components/SiteCard";
import { AddUrlForm } from "@/components/AddUrlForm";
import { HistoryPanel } from "@/components/HistoryPanel";
import { EmptyState } from "@/components/EmptyState";
import { Loader2, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const { sites, loading, error, addSite, deleteSite, scrapeSite, scrapeAll } = useSites();
  const [scrapingAll, setScrapingAll] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  const handleAdd = async (url: string, label?: string) => {
    const success = await addSite(url, label);
    if (success) {
      toast({ title: "Site ajouté ✓", description: `${label || url} est maintenant surveillé.`, variant: "success" });
    } else {
      toast({ title: "Erreur", description: "Impossible d'ajouter ce site.", variant: "destructive" });
    }
    return success;
  };

  const handleScrape = async (id: string) => {
    const result = await scrapeSite(id);
    if (result) {
      if (result.hasChanges) {
        toast({ title: "Changement détecté !", description: result.summary.slice(0, 100) + "…", variant: "default" });
      } else {
        toast({ title: "Aucun changement", description: "Le site n'a pas été modifié.", variant: "success" });
      }
    } else {
      toast({ title: "Erreur de scraping", description: "Impossible de vérifier ce site.", variant: "destructive" });
    }
    return result;
  };

  const handleDelete = async (id: string) => {
    const success = await deleteSite(id);
    if (success) {
      toast({ title: "Site supprimé", description: "Le site a été retiré de la surveillance." });
      if (selectedSiteId === id) setSelectedSiteId(null);
    }
    return success;
  };

  const handleScrapeAll = async () => {
    setScrapingAll(true);
    await scrapeAll();
    setScrapingAll(false);
    toast({ title: "Vérification terminée", description: `${sites.length} site${sites.length > 1 ? "s" : ""} vérifié${sites.length > 1 ? "s" : ""}.`, variant: "success" });
  };

  return (
    <div className="min-h-screen bg-[#09090b] dot-grid">
      <DashboardHeader sites={sites} onScrapeAll={handleScrapeAll} isScraping={scrapingAll} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page title + Add button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">
              Sites surveillés
              {sites.length > 0 && (
                <span className="ml-2.5 text-sm font-normal text-zinc-500">({sites.length})</span>
              )}
            </h2>
            <p className="text-sm text-zinc-600 mt-1">
              Détection intelligente des modifications par IA
            </p>
          </div>
          <AddUrlForm onAdd={handleAdd} />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
              <p className="text-sm text-zinc-500">Chargement des sites...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-4 bg-red-950/30 border border-red-900/40 rounded-xl mb-6"
          >
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </motion.div>
        )}

        {/* Sites grid */}
        {!loading && (
          <>
            {sites.length === 0 ? (
              <EmptyState />
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {sites.map((site) => (
                    <SiteCard
                      key={site.id}
                      site={site}
                      onScrape={handleScrape}
                      onDelete={handleDelete}
                      onViewHistory={setSelectedSiteId}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* History side panel */}
      <HistoryPanel siteId={selectedSiteId} onClose={() => setSelectedSiteId(null)} />

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
