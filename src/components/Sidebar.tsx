"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect, useCallback } from "react"
import { LogOut, ChevronLeft, ChevronRight, X, Menu, Command, Sun, Moon } from "lucide-react"
import { NAV_SECTIONS, ICON_MAP } from "@/lib/navigation"
import { useTheme } from "@/lib/theme"
import type { User } from "@supabase/supabase-js"

function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
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
  )
}

function NavItems({
  collapsed: isCollapsed,
  isActive,
  onNavigate,
}: {
  collapsed: boolean
  isActive: (href: string) => boolean
  onNavigate: () => void
}) {
  return (
    <nav className="flex-1 px-2 py-1 overflow-y-auto">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title} className="mb-3">
          {!isCollapsed && (
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              {section.title}
            </p>
          )}
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const active = isActive(item.href)
              const Icon = ICON_MAP[item.icon]
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13px] transition-all duration-150 ${
                    isCollapsed ? "justify-center" : ""
                  } ${
                    active
                      ? "bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)] font-medium"
                      : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`h-4 w-4 shrink-0 transition-colors ${active ? "text-[var(--color-accent-violet)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-tertiary)]"}`} />
                  {!isCollapsed && (
                    <>
                      <span>{item.label}</span>
                      {item.shortcut && <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-50 transition-opacity">{item.shortcut}</span>}
                    </>
                  )}
                  {active && !isCollapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-accent-violet)]" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

function UserFooter({
  user,
  collapsed,
  onSignOut,
  onNavigate,
}: {
  user: User | null
  collapsed: boolean
  onSignOut: () => void
  onNavigate: () => void
}) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="px-2 py-3 border-t border-[var(--color-border-subtle)]">
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        className={`flex items-center gap-2.5 w-full px-3 py-2 mb-1 rounded-[10px] text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors ${collapsed ? "justify-center" : ""}`}
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 shrink-0" />
        ) : (
          <Moon className="h-4 w-4 shrink-0" />
        )}
        {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
      </button>
      {user && !collapsed && (
        <Link href="/profile" onClick={onNavigate} className="flex items-center gap-2.5 px-3 py-2 mb-1 rounded-[10px] hover:bg-[var(--color-bg-hover)] transition-colors">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[var(--color-accent-violet)] to-[var(--color-accent-blue)] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
            {(user.email || "U")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[var(--color-text-secondary)] truncate">{user.user_metadata?.full_name || user.email}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] truncate">{user.email}</p>
          </div>
        </Link>
      )}
      <button
        onClick={onSignOut}
        aria-label="Sign out"
        className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-[10px] text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors ${collapsed ? "justify-center" : ""}`}
      >
        <LogOut className="h-4 w-4" />
        {!collapsed && <span>Sign Out</span>}
      </button>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!mobileOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [mobileOpen])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user)
    })
  }, [supabase.auth])

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }, [supabase, router])

  const isActive = useCallback((href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }, [pathname])

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className={`fixed top-4 left-4 z-30 md:hidden p-2.5 rounded-[10px] bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] transition-all ${mobileOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div role="dialog" aria-modal="true" className="absolute left-0 top-0 bottom-0 w-[260px] bg-[var(--color-bg-primary)] border-r border-[var(--color-border-subtle)] flex flex-col animate-slide-in-left">
            <div className="flex items-center justify-between px-3 py-5">
              <Logo />
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavItems collapsed={false} isActive={isActive} onNavigate={() => setMobileOpen(false)} />
            <UserFooter user={user} collapsed={false} onSignOut={handleSignOut} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-[var(--color-bg-primary)] border-r border-[var(--color-border-subtle)] transition-all duration-300 ease-[var(--ease-out)] ${
          collapsed ? "w-[68px]" : "w-[240px]"
        }`}
      >
        <Logo collapsed={collapsed} />
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
        <NavItems collapsed={collapsed} isActive={isActive} onNavigate={() => setMobileOpen(false)} />
        <UserFooter user={user} collapsed={collapsed} onSignOut={handleSignOut} onNavigate={() => setMobileOpen(false)} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border-default)] transition-all z-10"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>
    </>
  )
}
