import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-3 py-1 text-[12px] font-medium whitespace-nowrap transition-all",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground",
        secondary:
          "bg-muted text-muted-foreground border-border",
        destructive:
          "text-destructive border-destructive/30 bg-destructive/5",
        outline:
          "border-border text-foreground",
        success:
          "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
        warning:
          "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
        error:
          "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
