"use client"

import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <>
      <div className="text-center mb-7">
        <Link href="/" className="inline-flex items-center gap-2 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] gradient-violet shadow-glow">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <span className="text-lg font-bold font-[family-name:var(--font-display)]">HirePilot</span>
        </Link>
        <h1 className="text-xl font-bold font-[family-name:var(--font-display)] tracking-tight">Reset your password</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1.5">We&apos;ll send you a link to reset your password</p>
      </div>

      <div className="p-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">
        {sent ? (
          <div className="text-center py-4 space-y-3">
            <CheckCircle2 className="h-10 w-10 text-[var(--color-accent-emerald)] mx-auto" />
            <p className="text-sm text-[var(--color-text-secondary)]">Check your email for a password reset link.</p>
            <Link href="/login" className="text-xs text-[var(--color-accent-violet)] hover:text-[var(--color-accent-violet-dim)] font-medium transition-colors">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-3.5">
            <div>
              <Label htmlFor="forgot-email" className="text-[11px] font-medium text-[var(--color-text-tertiary)] mb-1.5 block">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--color-border-focus)] h-10 text-sm"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/20">
                <p className="text-[11px] text-[var(--color-accent-rose)]">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full gradient-violet text-white border-0 h-10 text-sm font-semibold hover:opacity-90 shadow-glow group">
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="h-3.5 w-3.5 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          </form>
        )}
      </div>

      <p className="text-center text-xs text-[var(--color-text-muted)] mt-5">
        <Link href="/login" className="text-[var(--color-accent-violet)] hover:text-[var(--color-accent-violet-dim)] font-medium transition-colors inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Back to sign in
        </Link>
      </p>
    </>
  )
}
