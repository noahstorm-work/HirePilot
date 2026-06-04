"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sparkles, Target, TrendingUp, Briefcase, Brain,
  BarChart3, ChevronRight, CheckCircle2, ArrowRight,
  Star, Zap, Shield, Globe, Users, Rocket
} from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "Why Am I Not Getting Interviews?",
    description: "AI analyzes your CV, LinkedIn, skills, and applications to reveal exactly what's holding you back.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: Target,
    title: "Interview Readiness Score",
    description: "A single score that tells you exactly how ready you are for interviews — and how to improve it.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: TrendingUp,
    title: "Job Match Engine",
    description: "AI matches your profile against real job listings and shows your strengths and missing skills.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: BarChart3,
    title: "Skills Gap Analysis",
    description: "Identify the exact skills, technologies, and keywords you're missing to land more interviews.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Briefcase,
    title: "Application Workspace",
    description: "Track every application with AI-powered insights, cover letters, and follow-up strategies.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
  {
    icon: Sparkles,
    title: "Interview Coach",
    description: "Generate technical questions, behavioral questions, STAR responses, and company-specific prep.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
]

const steps = [
  { step: "01", title: "Upload Your CV", description: "Paste your resume or LinkedIn profile in seconds." },
  { step: "02", title: "Run Career Analysis", description: "AI analyzes 8 key career dimensions in real-time." },
  { step: "03", title: "Discover Your Gaps", description: "See exactly what skills, keywords, and experience you're missing." },
  { step: "04", title: "Find Matching Jobs", description: "AI matches you against real opportunities with fit scores." },
  { step: "05", title: "Land More Interviews", description: "Improve your CV, prepare for interviews, and get hired faster." },
]

const testimonials = [
  { name: "Sarah K.", role: "Software Engineer", text: "HirePilot showed me my CV was missing 3 critical keywords. After fixing them, I got 4 interview callbacks in one week.", score: 92 },
  { name: "Marcus L.", role: "Product Manager", text: "The skills gap analysis was a wake-up call. I was applying to jobs I wasn't qualified for. Now I target the right ones.", score: 87 },
  { name: "Elena R.", role: "Data Scientist", text: "The interview coach prepared me better than any paid course. Landed my dream job at a FAANG company.", score: 95 },
]

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-[#1e1e24]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-violet">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span className="text-lg font-bold font-[family-name:var(--font-display)] tracking-tight">HirePilot</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-[#a0a0ab] hover:text-[#fafafa] hover:bg-[#1a1a1f]">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="gradient-violet text-white border-0 hover:opacity-90">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#27272f] bg-[#16161a] px-4 py-1.5 text-xs font-medium text-[#a0a0ab] mb-8 animate-fade-in">
              <Zap className="h-3 w-3 text-amber-400" />
              AI-Powered Career Intelligence
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold font-[family-name:var(--font-display)] tracking-tight leading-[1.1] mb-6 animate-slide-up">
              Why Aren&apos;t You
              <br />
              <span className="gradient-text-violet">Getting Interviews?</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-[#a0a0ab] max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up stagger-1">
              HirePilot AI analyzes your CV, LinkedIn, skills, and applications to show exactly what&apos;s holding you back and what to fix next.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-2">
              <Link href="/register">
                <Button size="lg" className="gradient-violet text-white border-0 px-8 py-6 text-base font-semibold hover:opacity-90 group">
                  Analyze My Career
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-[#27272f] text-[#a0a0ab] hover:text-[#fafafa] hover:bg-[#1a1a1f] px-8 py-6 text-base">
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 mx-auto max-w-4xl animate-slide-up stagger-3">
            <div className="relative rounded-2xl border border-[#1e1e24] bg-[#0f0f12] p-1 shadow-2xl shadow-violet-500/5">
              <div className="rounded-xl border border-[#1e1e24] bg-[#16161a] p-6 md:p-8">
                {/* Score Preview */}
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Main Score */}
                  <div className="md:col-span-1 flex flex-col items-center justify-center p-6 rounded-xl border border-[#1e1e24] bg-[#0f0f12]">
                    <div className="relative">
                      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="52" stroke="#1e1e24" strokeWidth="8" fill="none" />
                        <circle cx="60" cy="60" r="52" stroke="url(#scoreGradient)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${78 * 3.27} ${100 * 3.27}`} />
                        <defs>
                          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#7c3aed" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold font-[family-name:var(--font-display)]">78</span>
                        <span className="text-xs text-[#63636e]">/ 100</span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs font-medium text-[#a0a0ab]">Interview Readiness</p>
                  </div>

                  {/* Improvements */}
                  <div className="md:col-span-2 p-4 rounded-xl border border-[#1e1e24] bg-[#0f0f12]">
                    <p className="text-xs font-medium text-[#63636e] uppercase tracking-wider mb-4">Top Improvements</p>
                    <div className="space-y-3">
                      {[
                        { gain: "+6", action: "Add AWS project to portfolio", color: "text-emerald-400" },
                        { gain: "+4", action: "Improve LinkedIn headline", color: "text-blue-400" },
                        { gain: "+3", action: "Quantify achievements with metrics", color: "text-violet-400" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className={`text-sm font-bold font-[family-name:var(--font-mono)] ${item.color}`}>{item.gain}</span>
                          <div className="h-px flex-1 bg-[#1e1e24]" />
                          <span className="text-sm text-[#a0a0ab]">{item.action}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#1e1e24] flex items-center justify-between">
                      <span className="text-xs text-[#63636e]">Target Score</span>
                      <span className="text-sm font-bold font-[family-name:var(--font-display)] text-emerald-400">90 / 100</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {[
                    { label: "CV Score", value: "72", icon: Target },
                    { label: "Skills Match", value: "65%", icon: TrendingUp },
                    { label: "Market Fit", value: "81%", icon: BarChart3 },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#0f0f12] border border-[#1e1e24]">
                      <stat.icon className="h-4 w-4 text-violet-400" />
                      <div>
                        <p className="text-xs text-[#63636e]">{stat.label}</p>
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
      <section className="py-12 px-6 border-y border-[#1e1e24]">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          {[
            { value: "12,000+", label: "Career analyses run" },
            { value: "3.2x", label: "More interviews on average" },
            { value: "89%", label: "Users improve their score" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold font-[family-name:var(--font-display)] gradient-text-violet">{stat.value}</p>
              <p className="text-xs text-[#63636e] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-violet-400 uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] tracking-tight">
              Five steps to your next role
            </h2>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                <div className="p-5 rounded-xl border border-[#1e1e24] bg-[#0f0f12] hover:border-[#27272f] transition-all duration-300 h-full">
                  <span className="text-3xl font-bold font-[family-name:var(--font-display)] gradient-text-violet opacity-40 group-hover:opacity-100 transition-opacity">{step.step}</span>
                  <h3 className="text-sm font-semibold mt-3 mb-2 font-[family-name:var(--font-display)]">{step.title}</h3>
                  <p className="text-xs text-[#63636e] leading-relaxed">{step.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-px bg-[#27272f] z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-[#0f0f12]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-violet-400 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] tracking-tight">
              Everything you need to get hired
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-xl border border-[#1e1e24] bg-[#16161a] hover:border-[#27272f] transition-all duration-300"
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`inline-flex p-2.5 rounded-lg ${feature.bg} mb-4`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="text-base font-semibold mb-2 font-[family-name:var(--font-display)]">{feature.title}</h3>
                <p className="text-sm text-[#63636e] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-violet-400 uppercase tracking-widest mb-3">Results</p>
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] tracking-tight">
              People are landing more interviews
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 rounded-xl border border-[#1e1e24] bg-[#0f0f12]">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[#a0a0ab] leading-relaxed mb-4">&quot;{t.text}&quot;</p>
                <div className="flex items-center justify-between pt-4 border-t border-[#1e1e24]">
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-[#63636e]">{t.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#63636e]">Readiness Score</p>
                    <p className="text-lg font-bold font-[family-name:var(--font-display)] text-emerald-400">{t.score}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="relative p-12 rounded-2xl border border-[#1e1e24] bg-[#0f0f12] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-blue-600/10" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] tracking-tight mb-4">
                Start Landing Better Jobs Today
              </h2>
              <p className="text-[#a0a0ab] mb-8 max-w-lg mx-auto">
                Run a free career analysis and discover what&apos;s been holding you back from landing interviews.
              </p>
              <Link href="/register">
                <Button size="lg" className="gradient-violet text-white border-0 px-8 py-6 text-base font-semibold hover:opacity-90 group">
                  Run Free Career Analysis
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#1e1e24]">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md gradient-violet">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span className="text-sm font-semibold font-[family-name:var(--font-display)]">HirePilot AI</span>
          </div>
          <p className="text-xs text-[#45454e]">&copy; 2026 HirePilot AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
