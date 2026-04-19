"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-red-950/40 border border-red-900/40 mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-xl font-semibold text-zinc-100 mb-2">Une erreur est survenue</h1>
        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
          {error.message || "Quelque chose s'est mal passé. Veuillez réessayer."}
        </p>
        {error.digest && (
          <p className="text-xs text-zinc-700 font-mono mb-6">ID: {error.digest}</p>
        )}
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </Button>
      </motion.div>
    </div>
  );
}
