import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-[38px] w-full min-w-0 rounded-md border border-border bg-surface px-[14px] py-[10px] text-[14px] text-foreground transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-neutral focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-[rgba(99,102,241,0.12)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-[rgba(239,68,68,0.12)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
