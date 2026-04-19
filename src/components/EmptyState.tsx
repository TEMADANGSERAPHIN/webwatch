"use client";
import { motion } from "framer-motion";
import { Globe, Radar, Zap } from "lucide-react";

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col items-center justify-center py-24 px-6 text-center"
    >
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <Radar className="h-9 w-9 text-zinc-600" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl border border-violet-500/20"
        />
      </div>

      <h2 className="text-lg font-semibold text-zinc-200 mb-2">Aucun site surveillé</h2>
      <p className="text-sm text-zinc-500 max-w-xs leading-relaxed mb-8">
        Commencez par ajouter une URL pour que WebWatch surveille ses changements en temps réel.
      </p>

      <div className="grid grid-cols-3 gap-4 text-center max-w-sm w-full">
        {[
          { icon: Globe, label: "Scraping", desc: "via Firecrawl" },
          { icon: Zap, label: "Détection", desc: "instantanée" },
          { icon: Radar, label: "Analyse IA", desc: "via GPT-4o" },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <Icon className="h-5 w-5 text-violet-400 mx-auto mb-1.5" />
            <p className="text-xs font-medium text-zinc-300">{label}</p>
            <p className="text-xs text-zinc-600">{desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
