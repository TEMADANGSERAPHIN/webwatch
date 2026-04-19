import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-7xl font-bold text-zinc-800 mb-4">404</p>
        <h1 className="text-xl font-semibold text-zinc-300 mb-2">Page introuvable</h1>
        <p className="text-sm text-zinc-500 mb-8">Cette page n'existe pas ou a été déplacée.</p>
        <Button asChild>
          <Link href="/" className="gap-2">
            <Home className="h-4 w-4" />
            Retour au dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
