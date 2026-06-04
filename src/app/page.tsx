"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Brain, Target, TrendingUp, Briefcase, BarChart3,
  ArrowRight, FileCheck, Sparkles, Zap, ChevronRight, Star
} from "lucide-react"

const features = [
  { icon: Brain, title: "Career Analysis", description: "AI analyzes 8 career dimensions to find exactly what's holding you back.", color: "text-[var(--color-accent-violet)]" },
  { icon: Target, title: "Readiness Score", description: "A single score showing your interview readiness — with a clear path to improve.", color: "text-[var(--color-accent-blue)]" },
  { icon: TrendingUp, title: "Job Matching", description: "AI matches your profile against real jobs with fit scores and gap analysis.", color: "text-[var(--color-accent-emerald)]" },
  { icon: BarChart3, title: "Skills Gaps", description: "Identify missing skills, keywords, and technologies holding you back.", color: "text-[var(--color-accent-amber)]" },
  { icon: FileCheck, title: "ATS Checker", description: "Scan your CV against ATS systems. Fix formatting and keyword issues.", color: "text-[var(--color-accent-cyan)]" },
  { icon: Sparkles, title: "Interview Coach", description: "Generate technical questions, STAR responses, and company-specific prep.", color: "text-[var(--color-accent-rose)]" },
]

const steps = [
  { step: "01", title: "Upload CV", desc: "Paste your resume in seconds" },
  { step: "02", title: "Analyze", desc: "AI scans 8 career dimensions" },
  { step: "03", title: "Discover Gaps", desc: "See what's missing" },
  { step: "04", title: "Find Jobs", desc: "AI-matched opportunities" },
  { step: "05", title: "Get Hired", desc: "Land more interviews" },
]

const testimonials = [
  { name: "Sarah K.", role: "Software Engineer", text: "HirePilot showed me my CV was missing 3 critical keywords. After fixing them, I got 4 interview callbacks in one week.", score: 92 },
  { name: "Marcus L.", role: "Product Manager", text: "The skills gap analysis was a wake-up call. Now I target the right roles and get more responses.", score: 87 },
  { name: "Elena R.", role: "Data Scientist", text: "The interview coach prepared me better than any paid course. Landed my dream job.", score: 95 },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-[var(--color-border-subtle)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] gradient-violet shadow-glow">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span className="text-[15px] font-bold font-[family-name:var(--font-display)] tracking-tight">HirePilot</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="gradient-violet text-white border-0 hover:opacity-90 shadow-glow">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[var(--color-accent-violet)]/8 rounded-full blur-[120px]" />
          <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-[var(--color-accent-blue)]/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 py-1.5 text-xs font-medium text-[var(--color-text-tertiary)] mb-8 animate-fade-in">
              <Zap className="h-3 w-3 text-[var(--color-accent-amber)]" />
              AI-Powered Career Intelligence
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-display)] tracking-tight leading-[1.08] mb-6 animate-slide-up text-balance">
              Why Aren&apos;t You
              <br />
              <span className="gradient-text-hero">Getting Interviews?</span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed animate-slide-up stagger-1 text-pretty">
              HirePilot AI analyzes your CV, LinkedIn, skills, and applications to show exactly what&apos;s holding you back — and how to fix it.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up stagger-2">
              <Link href="/register">
                <Button size="lg" className="gradient-violet text-white border-0 px-7 py-5 text-sm font-semibold hover:opacity-90 shadow-glow-lg group">
                  Analyze My Career
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] px-7 py-5 text-sm">
                  Try Demo Account
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual — Score Preview */}
          <div className="mt-16 mx-auto max-w-3xl animate-slide-up-strong stagger-3">
            <div className="relative rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-1 shadow-2xl">
              <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-6 md:p-8">
                <div className="grid md:grid-cols-[200px_1fr] gap-6">
                  {/* Score */}
                  <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" stroke="var(--color-border-subtle)" strokeWidth="8" fill="none" />
                      <circle cx="60" cy="60" r="52" stroke="url(#heroGrad)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${78 * 3.27} ${100 * 3.27}`} />
                      <defs>
                        <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#7c3aed" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold font-[family-name:var(--font-display)]">78</span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">/ 100</span>
                    </div>
                    <p className="mt-2 text-xs font-medium text-[var(--color-text-secondary)]">Interview Readiness</p>
                  </div>

                  {/* Improvements */}
                  <div className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]">
                    <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">Top Improvements</p>
                    <div className="space-y-3">
                      {[
                        { gain: "+6", action: "Add AWS project to portfolio", color: "text-[var(--color-accent-emerald)]" },
                        { gain: "+4", action: "Improve LinkedIn headline", color: "text-[var(--color-accent-blue)]" },
                        { gain: "+3", action: "Quantify achievements with metrics", color: "text-[var(--color-accent-violet)]" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className={`text-sm font-bold font-[family-name:var(--font-mono)] ${item.color}`}>{item.gain}</span>
                          <div className="h-px flex-1 bg-[var(--color-border-subtle)]" />
                          <span className="text-xs text-[var(--color-text-secondary)]">{item.action}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                      <span className="text-[10px] text-[var(--color-text-muted)]">Target Score</span>
                      <span className="text-sm font-bold font-[family-name:var(--font-display)] text-[var(--color-accent-emerald)]">90</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: "CV Score", value: "72", icon: Target },
                    { label: "Skills Match", value: "65%", icon: TrendingUp },
                    { label: "Market Fit", value: "81%", icon: BarChart3 },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]">
                      <stat.icon className="h-3.5 w-3.5 text-[var(--color-accent-violet)]" />
                      <div>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{stat.label}</p>
                        <p className="text-sm font-bold font-[family-name:var(--font-display)]">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 px-5 border-y border-[var(--color-border-subtle)]">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          {[
            { value: "12,000+", label: "Analyses run" },
            { value: "3.2x", label: "More interviews" },
            { value: "89%", label: "Improve score" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-xl font-bold font-[family-name:var(--font-display)] gradient-text-violet">{stat.value}</p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-5">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-[11px] font-semibold text-[var(--color-accent-violet)] uppercase tracking-widest mb-2">How It Works</p>
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)] tracking-tight">
              Five steps to your next role
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {steps.map((step, i) => (
              <div key={i} className="group relative">
                <div className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-default h-full">
                  <span className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-accent-violet)] opacity-30 group-hover:opacity-100 transition-opacity">{step.step}</span>
                  <h3 className="text-sm font-semibold mt-2 mb-1 font-[family-name:var(--font-display)]">{step.title}</h3>
                  <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-1.5 w-3 h-px bg-[var(--color-border-default)]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-5 bg-[var(--color-bg-secondary)]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-[11px] font-semibold text-[var(--color-accent-violet)] uppercase tracking-widest mb-2">Features</p>
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)] tracking-tight">
              Everything you need to get hired
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((feature, i) => (
              <div key={i} className="group p-5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-default">
                <div className="inline-flex p-2 rounded-[10px] bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] mb-3">
                  <feature.icon className={`h-4 w-4 ${feature.color}`} />
                </div>
                <h3 className="text-sm font-semibold mb-1 font-[family-name:var(--font-display)]">{feature.title}</h3>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-5">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <p className="text-[11px] font-semibold text-[var(--color-accent-violet)] uppercase tracking-widest mb-2">Results</p>
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)] tracking-tight">
              People are landing more interviews
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {testimonials.map((t, i) => (
              <div key={i} className="p-5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-3 w-3 fill-[var(--color-accent-amber)] text-[var(--color-accent-amber)]" />
                  ))}
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">&quot;{t.text}&quot;</p>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-subtle)]">
                  <div>
                    <p className="text-xs font-medium">{t.name}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{t.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[var(--color-text-muted)]">Score</p>
                    <p className="text-lg font-bold font-[family-name:var(--font-display)] text-[var(--color-accent-emerald)]">{t.score}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-5">
        <div className="mx-auto max-w-2xl text-center">
          <div className="relative p-10 sm:p-12 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-violet)]/8 via-transparent to-[var(--color-accent-blue)]/8" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)] tracking-tight mb-3">
                Start Landing Better Jobs Today
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mb-7 max-w-md mx-auto">
                Run a free career analysis and discover what&apos;s holding you back.
              </p>
              <Link href="/register">
                <Button size="lg" className="gradient-violet text-white border-0 px-7 py-5 text-sm font-semibold hover:opacity-90 shadow-glow-lg group">
                  Run Free Career Analysis
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-5 border-t border-[var(--color-border-subtle)]">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md gradient-violet">
              <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span className="text-xs font-semibold font-[family-name:var(--font-display)]">HirePilot AI</span>
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)]">&copy; 2026 HirePilot AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
