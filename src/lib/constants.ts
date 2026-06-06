import type { ApplicationStatus } from "@/types"

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "Saved",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
]

export const STATUS_COLORS: Record<ApplicationStatus, { bg: string; text: string; dot: string; pill: string }> = {
  Saved: { bg: "bg-[var(--color-text-muted)]/10", text: "text-[var(--color-text-muted)]", dot: "bg-[var(--color-text-muted)]", pill: "bg-[var(--color-text-muted)]/60" },
  Applied: { bg: "bg-[var(--color-accent-blue)]/10", text: "text-[var(--color-accent-blue)]", dot: "bg-[var(--color-accent-blue)]", pill: "bg-[var(--color-accent-blue)]/60" },
  Interview: { bg: "bg-[var(--color-accent-violet)]/10", text: "text-[var(--color-accent-violet)]", dot: "bg-[var(--color-accent-violet)]", pill: "bg-[var(--color-accent-violet)]/60" },
  Offer: { bg: "bg-[var(--color-accent-emerald)]/10", text: "text-[var(--color-accent-emerald)]", dot: "bg-[var(--color-accent-emerald)]", pill: "bg-[var(--color-accent-emerald)]/60" },
  Rejected: { bg: "bg-[var(--color-accent-rose)]/10", text: "text-[var(--color-accent-rose)]", dot: "bg-[var(--color-accent-rose)]", pill: "bg-[var(--color-accent-rose)]/60" },
}
