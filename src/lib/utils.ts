import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "Jamais";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHour < 24) return `Il y a ${diffHour}h`;
  if (diffDay === 1) return "Hier";
  if (diffDay < 30) return `Il y a ${diffDay} jours`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "ok": return "text-green-400";
    case "changed": return "text-violet-400";
    case "error": return "text-red-400";
    case "checking": return "text-yellow-400";
    default: return "text-zinc-500";
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case "ok": return "bg-green-400/10 border-green-400/20";
    case "changed": return "bg-violet-400/10 border-violet-400/20";
    case "error": return "bg-red-400/10 border-red-400/20";
    case "checking": return "bg-yellow-400/10 border-yellow-400/20";
    default: return "bg-zinc-800/50 border-zinc-700/50";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "ok": return "Stable";
    case "changed": return "Modifié";
    case "error": return "Erreur";
    case "checking": return "Vérification...";
    default: return "En attente";
  }
}
