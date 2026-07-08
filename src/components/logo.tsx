import { cn } from "@/lib/utils"

export const Logo = ({ className }: { className?: string }) => (
  <span className={cn("font-heading text-lg font-bold tracking-[-0.03em] text-foreground", className)}>
    genesis
  </span>
);
