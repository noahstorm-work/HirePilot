"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Mail, Lock, User } from "lucide-react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push("/profile")
  }

  const passwordStrength = (pw: string) => {
    let score = 0
    if (pw.length >= 8) score++
    if (pw.length >= 12) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }

  const strength = passwordStrength(password)
  const strengthColor = strength <= 2 ? "bg-[var(--color-accent-rose)]" : strength <= 3 ? "bg-[var(--color-accent-amber)]" : "bg-[var(--color-accent-emerald)]"
  const strengthLabel = strength <= 2 ? "Weak" : strength <= 3 ? "Fair" : strength <= 4 ? "Good" : "Strong"

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-[var(--color-bg-primary)]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-[var(--color-accent-violet)]/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[400px]">
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] gradient-violet shadow-glow">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span className="text-lg font-bold font-[family-name:var(--font-display)]">HirePilot</span>
          </Link>
          <h1 className="text-xl font-bold font-[family-name:var(--font-display)] tracking-tight">Create your account</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5">Start your career transformation in 30 seconds</p>
        </div>

        <div className="p-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)] mb-1.5 block">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-9 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] h-10 text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)] mb-1.5 block">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] h-10 text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)] mb-1.5 block">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                <Input
                  type="password"
                  placeholder="8+ characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] h-10 text-sm"
                  required
                  minLength={8}
                />
              </div>
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strengthColor}`} style={{ width: `${(strength / 5) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{strengthLabel}</span>
                </div>
              )}
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
                  Create Account
                  <ArrowRight className="h-3.5 w-3.5 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[var(--color-text-muted)] mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--color-accent-violet)] hover:text-[var(--color-accent-violet-dim)] font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
