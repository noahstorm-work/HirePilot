import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]",
        primary: "bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)] border border-[var(--color-accent-violet)]/20",
        success: "bg-[var(--color-accent-emerald)]/10 text-[var(--color-accent-emerald)] border border-[var(--color-accent-emerald)]/20",
        warning: "bg-[var(--color-accent-amber)]/10 text-[var(--color-accent-amber)] border border-[var(--color-accent-amber)]/20",
        destructive: "bg-[var(--color-accent-rose)]/10 text-[var(--color-accent-rose)] border border-[var(--color-accent-rose)]/20",
        outline: "border border-[var(--color-border-default)] text-[var(--color-text-secondary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
