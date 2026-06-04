import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border border-[#1e1e24] bg-[#16161a] px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#45454e] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = "Textarea"

export { Textarea }
