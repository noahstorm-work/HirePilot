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
      options: { data: { full_name: fullName } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push("/profile")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#09090b]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-violet">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-display)]">HirePilot AI</span>
          </Link>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] tracking-tight">Create your account</h1>
          <p className="text-sm text-[#63636e] mt-2">Start your career transformation in 30 seconds</p>
        </div>

        <div className="p-8 rounded-2xl border border-[#1e1e24] bg-[#0f0f12]">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-[#a0a0ab] mb-1.5 block">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#45454e]" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 bg-[#16161a] border-[#1e1e24] text-[#fafafa] placeholder:text-[#45454e] focus:border-violet-500 focus:ring-violet-500/20 h-11"
                  required
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-[#a0a0ab] mb-1.5 block">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#45454e]" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-[#16161a] border-[#1e1e24] text-[#fafafa] placeholder:text-[#45454e] focus:border-violet-500 focus:ring-violet-500/20 h-11"
                  required
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-[#a0a0ab] mb-1.5 block">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#45454e]" />
                <Input
                  type="password"
                  placeholder="8+ characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-[#16161a] border-[#1e1e24] text-[#fafafa] placeholder:text-[#45454e] focus:border-violet-500 focus:ring-violet-500/20 h-11"
                  required
                  minLength={8}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <p className="text-xs text-rose-400">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full gradient-violet text-white border-0 h-11 font-semibold hover:opacity-90 group">
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#63636e] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
