"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2, Loader2, AlertTriangle } from "lucide-react"

interface DangerZoneSectionProps {
  deleteConfirm: string
  setDeleteConfirm: (v: string) => void
  deleting: boolean
  handleDeleteAccount: () => void
}

export function DangerZoneSection({
  deleteConfirm,
  setDeleteConfirm,
  deleting,
  handleDeleteAccount,
}: DangerZoneSectionProps) {
  return (
    <div className="surface-card p-5 border border-[var(--color-accent-rose)]/20">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-[11px] font-medium text-[var(--color-accent-rose)] block">
            Delete Account
          </Label>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            Permanently delete your account and all data. This cannot be undone.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 border-[var(--color-accent-rose)]/30 text-[var(--color-accent-rose)] hover:bg-[var(--color-accent-rose)]/10"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[var(--color-bg-card)] border-[var(--color-border-subtle)]">
            <DialogHeader>
              <DialogTitle className="font-[family-name:var(--font-display)] text-sm text-[var(--color-accent-rose)]">
                Delete Account
              </DialogTitle>
              <DialogDescription className="sr-only">Confirm account deletion</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/20">
                <AlertTriangle className="h-4 w-4 text-[var(--color-accent-rose)] shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--color-text-secondary)]">
                  This will permanently delete your account, profile, all applications, AI results, and saved
                  jobs. This action is irreversible.
                </p>
              </div>
              <div>
                <Label htmlFor="delete-confirm" className="text-[10px] text-[var(--color-text-muted)] mb-1 block">
                  Type{" "}
                  <span className="font-medium text-[var(--color-accent-rose)]">DELETE</span> to confirm
                </Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-accent-rose)] h-9 text-sm"
                  placeholder="DELETE"
                />
              </div>
              <Button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirm !== "DELETE"}
                className="w-full bg-[var(--color-accent-rose)] text-white border-0 hover:opacity-90 h-9 text-sm"
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                )}
                {deleting ? "Deleting..." : "Permanently Delete Account"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}