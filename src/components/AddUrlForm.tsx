"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Globe, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { isValidUrl } from "@/lib/utils";

interface AddUrlFormProps {
  onAdd: (url: string, label?: string) => Promise<boolean>;
}

export function AddUrlForm({ onAdd }: AddUrlFormProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState("");

  const validate = (value: string) => {
    const normalized = value.startsWith("http") ? value : `https://${value}`;
    if (!isValidUrl(normalized)) {
      setUrlError("URL invalide. Exemple : https://example.com");
      return false;
    }
    setUrlError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!url.trim()) { setUrlError("L'URL est requise"); return; }
    if (!validate(url)) return;
    setLoading(true);
    const success = await onAdd(url.trim(), label.trim() || undefined);
    setLoading(false);
    if (success) {
      setUrl(""); setLabel(""); setOpen(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Ajouter un site
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-violet-400" />
              Surveiller un nouveau site
            </DialogTitle>
            <DialogDescription>
              Entrez l'URL d'un site public. WebWatch en détectera les changements automatiquement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium uppercase tracking-wide">
                URL *
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); if (urlError) validate(e.target.value); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="pl-9"
                  autoFocus
                />
              </div>
              {urlError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400"
                >
                  {urlError}
                </motion.p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium uppercase tracking-wide">
                Nom personnalisé (optionnel)
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Mon blog, Documentation API..."
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={loading || !url.trim()}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Ajout...</>
                ) : (
                  <><Plus className="h-4 w-4" /> Ajouter</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
