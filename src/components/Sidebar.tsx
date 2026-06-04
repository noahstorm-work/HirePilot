"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import {
  LayoutDashboard, Search, Briefcase, Brain, BarChart3,
  User, LogOut, ChevronLeft, ChevronRight, Sparkles, X, Menu
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/career-analysis", label: "Career Analysis", icon: Brain },
  { href: "/discover", label: "Jobs", icon: Search },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/dashboard/interview-coach", label: "Interview Coach", icon: Sparkles },
  { href: "/dashboard/insights", label: "Insights", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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
      <div className={`flex items-center gap-2.5 px-3 py-4 ${collapsed ? "justify-center" : ""}`}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-violet">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        {!collapsed && (
          <span className="text-base font-bold font-[family-name:var(--font-display)] tracking-tight">HirePilot</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-violet-500/10 text-violet-400 font-medium"
                  : "text-[#63636e] hover:text-[#a0a0ab] hover:bg-[#16161a]"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-violet-400" : ""}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 space-y-1">
        <button
          onClick={handleSignOut}
          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-[#63636e] hover:text-[#a0a0ab] hover:bg-[#16161a] transition-colors ${collapsed ? "justify-center" : ""}`}
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
        className={`fixed top-4 left-4 z-30 md:hidden p-2 rounded-lg bg-[#16161a] border border-[#1e1e24] text-[#a0a0ab] transition-opacity ${mobileOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#0f0f12] border-r border-[#1e1e24] flex flex-col">
            <div className="flex items-center justify-between px-3 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-violet">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <span className="text-base font-bold font-[family-name:var(--font-display)]">HirePilot</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-[#63636e]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 px-2 py-2 space-y-0.5">
              {navItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      active ? "bg-violet-500/10 text-violet-400 font-medium" : "text-[#63636e] hover:text-[#a0a0ab] hover:bg-[#16161a]"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${active ? "text-violet-400" : ""}`} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="px-2 py-3">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-[#63636e] hover:text-[#a0a0ab] hover:bg-[#16161a]"
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
        className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-[#09090b] border-r border-[#1e1e24] transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-60"
        }`}
      >
        <SidebarContent />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#16161a] border border-[#1e1e24] flex items-center justify-center text-[#63636e] hover:text-[#a0a0ab] transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>
    </>
  )
}
