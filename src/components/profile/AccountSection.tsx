"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Lock, Loader2 } from "lucide-react"

interface AccountSectionProps {
  userEmail: string
  newPassword: string
  setNewPassword: (v: string) => void
  changingPassword: boolean
  handleChangePassword: () => void
}

export function AccountSection({
  userEmail,
  newPassword,
  setNewPassword,
  changingPassword,
  handleChangePassword,
}: AccountSectionProps) {
  return (
    <div className="surface-card p-5 space-y-3.5">
      <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)] block">Account</Label>
      <div>
        <Label htmlFor="profile-email" className="text-[10px] text-[var(--color-text-muted)] mb-1 block">
          Email
        </Label>
        <Input
          id="profile-email"
          value={userEmail}
          disabled
          className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-tertiary)] h-9 text-sm opacity-60"
        />
      </div>
      <div>
        <Label htmlFor="profile-new-password" className="text-[10px] text-[var(--color-text-muted)] mb-1 block">
          Change Password
        </Label>
        <div className="flex gap-2">
          <Input
            id="profile-new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="flex-1 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus-visible:border-[var(--color-border-focus)] h-9 text-sm"
            placeholder="New password (8+ chars)"
            minLength={8}
          />
          <Button
            onClick={handleChangePassword}
            disabled={changingPassword || newPassword.length < 8}
            variant="outline"
            size="sm"
            className="h-9 px-3 border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]"
          >
            {changingPassword ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Lock className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}