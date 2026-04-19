import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-violet-600/20 text-violet-300 border-violet-600/30",
        ok: "border-green-800/50 bg-green-900/30 text-green-400",
        changed: "border-violet-700/50 bg-violet-900/30 text-violet-300",
        error: "border-red-800/50 bg-red-900/30 text-red-400",
        checking: "border-yellow-800/50 bg-yellow-900/30 text-yellow-400",
        pending: "border-zinc-700/50 bg-zinc-800/50 text-zinc-400",
        outline: "border-zinc-700 text-zinc-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
