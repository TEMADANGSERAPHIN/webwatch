import { cn } from "@/lib/utils";
import { SiteStatus } from "@/types";

interface StatusDotProps {
  status: SiteStatus;
  className?: string;
}

const colorMap: Record<SiteStatus, string> = {
  ok: "bg-green-400",
  changed: "bg-violet-400",
  error: "bg-red-400",
  checking: "bg-yellow-400",
  pending: "bg-zinc-500",
};

const pulseMap: Record<SiteStatus, boolean> = {
  ok: false,
  changed: true,
  error: false,
  checking: true,
  pending: false,
};

export function StatusDot({ status, className }: StatusDotProps) {
  const color = colorMap[status];
  const animate = pulseMap[status];
  return (
    <span className={cn("relative inline-flex h-2 w-2", className)}>
      {animate && (
        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-60", color)} />
      )}
      <span className={cn("relative inline-flex rounded-full h-2 w-2", color)} />
    </span>
  );
}
