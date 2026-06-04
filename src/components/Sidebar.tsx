"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import {
  LayoutDashboard, Search, Briefcase, Brain, BarChart3,
  User, LogOut, ChevronLeft, ChevronRight, Sparkles, X, Menu,
  FileCheck, Target, GitBranch, Command
} from "lucide-react"

const navSections = [
  {
    label: "Core",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "⌘1" },
      { href: "/dashboard/career-analysis", label: "Career Analysis", icon: Brain, shortcut: "⌘2" },
      { href: "/discover", label: "Jobs", icon: Search, shortcut: "⌘3" },
      { href: "/applications", label: "Applications", icon: Briefcase, shortcut: "⌘4" },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { href: "/dashboard/interview-coach", label: "Interview Coach", icon: Sparkles, shortcut: "⌘5" },
      { href: "/dashboard/ats-checker", label: "ATS Checker", icon: FileCheck, shortcut: "⌘6" },
      { href: "/dashboard/skills-gap", label: "Skills Gap", icon: Target, shortcut: "⌘7" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/dashboard/insights", label: "Insights", icon: BarChart3, shortcut: "⌘8" },
      { href: "/dashboard/cv-versions", label: "CV Versions", icon: GitBranch, shortcut: "⌘9" },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user)
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-3 py-5 ${collapsed ? "justify-center" : ""}`}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] gradient-violet shadow-glow">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        {!collapsed && (
          <span className="text-[15px] font-bold font-[family-name:var(--font-display)] tracking-tight">HirePilot</span>
        )}
      </div>

      {/* Search trigger */}
      {!collapsed && (
        <div className="px-3 mb-2">
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-[10px] text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] hover:text-[var(--color-text-tertiary)] transition-all"
          >
            <Command className="h-3 w-3" />
            <span>Search</span>
            <span className="ml-auto text-[10px] opacity-50">⌘K</span>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label} className="mb-3">
            {!collapsed && (
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`group flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13px] transition-all duration-150 ${
                      collapsed ? "justify-center" : ""
                    } ${
                      active
                        ? "bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)] font-medium"
                        : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className={`h-4 w-4 shrink-0 transition-colors ${active ? "text-[var(--color-accent-violet)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-tertiary)]"}`} />
                    {!collapsed && (
                      <>
                        <span>{item.label}</span>
                        <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-50 transition-opacity">{item.shortcut}</span>
                      </>
                    )}
                    {active && !collapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-accent-violet)]" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Footer */}
      <div className="px-2 py-3 border-t border-[var(--color-border-subtle)]">
        {user && !collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[var(--color-accent-violet)] to-[var(--color-accent-blue)] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
              {(user.email || "U")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--color-text-secondary)] truncate">{user.user_metadata?.full_name || user.email}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-[10px] text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className={`fixed top-4 left-4 z-30 md:hidden p-2.5 rounded-[10px] bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] transition-all ${mobileOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[260px] bg-[var(--color-bg-primary)] border-r border-[var(--color-border-subtle)] flex flex-col animate-slide-in-left">
            <div className="flex items-center justify-between px-3 py-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-[10px] gradient-violet">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <span className="text-[15px] font-bold font-[family-name:var(--font-display)]">HirePilot</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 px-2 py-1 overflow-y-auto">
              {navSections.map((section) => (
                <div key={section.label} className="mb-3">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                    {section.label}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const active = isActive(item.href)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13px] transition-colors ${
                            active ? "bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)] font-medium" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                          }`}
                        >
                          <item.icon className={`h-4 w-4 ${active ? "text-[var(--color-accent-violet)]" : "text-[var(--color-text-muted)]"}`} />
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <div className="px-2 py-3 border-t border-[var(--color-border-subtle)]">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[10px] text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-[var(--color-bg-primary)] border-r border-[var(--color-border-subtle)] transition-all duration-300 ease-[var(--ease-out)] ${
          collapsed ? "w-[68px]" : "w-[240px]"
        }`}
      >
        <SidebarContent />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border-default)] transition-all z-10"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>
    </>
  )
}
