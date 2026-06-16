"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Mail, Lock, Zap } from "lucide-react"
import { logError } from "@/lib/error-service"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push("/dashboard")
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/demo-credentials")
      const json = await res.json()
      if (!json.success || !json.data) {
        setError(json.error || "Demo account unavailable")
        setLoading(false)
        return
      }
      const { email: demoEmail, password: demoPassword } = json.data
      const { error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      router.push("/dashboard")
    } catch {
      setError("Failed to load demo credentials")
      setLoading(false)
      logError("Demo credential load failed", "Failed to load demo credentials", "login-demo")
    }
  }

  return (
    <>
      <div className="text-center mb-7">
        <Link href="/" className="inline-flex items-center gap-2 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] gradient-violet shadow-glow" aria-hidden="true">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <span className="text-lg font-bold font-[family-name:var(--font-display)]">HirePilot</span>
        </Link>
        <h1 className="text-xl font-bold font-[family-name:var(--font-display)] tracking-tight">Welcome back</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1.5">Sign in to your career cockpit</p>
      </div>

      <div className="p-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <Label htmlFor="login-email" className="text-[11px] font-medium text-[var(--color-text-tertiary)] mb-1.5 block">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" aria-hidden="true" />
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--color-border-focus)] h-10 text-sm"
                required
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="login-password" className="text-[11px] font-medium text-[var(--color-text-tertiary)] block">Password</Label>
              <Link href="/forgot-password" className="text-[10px] text-[var(--color-accent-violet)] hover:text-[var(--color-accent-violet-dim)] transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" aria-hidden="true" />
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--color-border-focus)] h-10 text-sm"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/20" role="alert" aria-live="assertive">
              <p className="text-[11px] text-[var(--color-accent-rose)]">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full gradient-violet text-white border-0 h-10 text-sm font-semibold hover:opacity-90 shadow-glow group">
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-label="Loading" role="status" />
            ) : (
              <>
                Sign In
                <ArrowRight className="h-3.5 w-3.5 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-border-subtle)]" />
          </div>
          <div className="relative flex justify-center text-[11px]">
            <span className="bg-[var(--color-bg-card)] px-2.5 text-[var(--color-text-muted)]">or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] h-10 text-sm font-medium"
        >
          <Zap className="h-3.5 w-3.5 mr-2 text-[var(--color-accent-amber)]" aria-hidden="true" />
          Try Demo Account
        </Button>
      </div>

      <p className="text-center text-xs text-[var(--color-text-muted)] mt-5">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[var(--color-accent-violet)] hover:text-[var(--color-accent-violet-dim)] font-medium transition-colors">
          Create one free
        </Link>
      </p>
    </>
  )
}
