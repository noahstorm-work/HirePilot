"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard, Search, Briefcase, Brain, BarChart3,
  User, Sparkles, FileCheck, Target, GitBranch,
  ArrowRight, CornerDownLeft
} from "lucide-react"

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: any
  href: string
  section: string
  shortcut?: string
}

const commands: CommandItem[] = [
  { id: "dashboard", label: "Dashboard", description: "Career overview", icon: LayoutDashboard, href: "/dashboard", section: "Pages", shortcut: "⌘1" },
  { id: "career-analysis", label: "Career Analysis", description: "Run AI analysis", icon: Brain, href: "/dashboard/career-analysis", section: "Pages", shortcut: "⌘2" },
  { id: "jobs", label: "Discover Jobs", description: "Search opportunities", icon: Search, href: "/discover", section: "Pages", shortcut: "⌘3" },
  { id: "applications", label: "Applications", description: "Track pipeline", icon: Briefcase, href: "/applications", section: "Pages", shortcut: "⌘4" },
  { id: "interview-coach", label: "Interview Coach", description: "AI prep questions", icon: Sparkles, href: "/dashboard/interview-coach", section: "Pages", shortcut: "⌘5" },
  { id: "ats-checker", label: "ATS Checker", description: "Resume optimization", icon: FileCheck, href: "/dashboard/ats-checker", section: "Pages", shortcut: "⌘6" },
  { id: "skills-gap", label: "Skills Gap", description: "Track missing skills", icon: Target, href: "/dashboard/skills-gap", section: "Pages", shortcut: "⌘7" },
  { id: "insights", label: "Insights", description: "Career intelligence", icon: BarChart3, href: "/dashboard/insights", section: "Pages", shortcut: "⌘8" },
  { id: "cv-versions", label: "CV Versions", description: "Version history", icon: GitBranch, href: "/dashboard/cv-versions", section: "Pages", shortcut: "⌘9" },
  { id: "profile", label: "Profile", description: "Manage profile", icon: User, href: "/profile", section: "Pages" },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(query.toLowerCase())
  )

  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.section]) acc[cmd.section] = []
    acc[cmd.section].push(cmd)
    return acc
  }, {} as Record<string, CommandItem[]>)

  const flatFiltered = Object.values(grouped).flat()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery("")
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, flatFiltered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && flatFiltered[selectedIndex]) {
      handleSelect(flatFiltered[selectedIndex].href)
    }
  }

  if (!open) return null

  let globalIndex = -1

  return (
    <div className="command-overlay" onClick={() => setOpen(false)}>
      <div className="command-modal" onClick={(e) => e.stopPropagation()}>
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border-subtle)]">
          <Search className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, actions..."
            className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
          />
          <kbd className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--color-border-subtle)]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[320px] overflow-y-auto p-1.5">
          {Object.entries(grouped).length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[var(--color-text-muted)]">No results found</p>
            </div>
          ) : (
            Object.entries(grouped).map(([section, items]) => (
              <div key={section}>
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                  {section}
                </p>
                {items.map((cmd) => {
                  globalIndex++
                  const isSelected = globalIndex === selectedIndex
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => handleSelect(cmd.href)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] text-left transition-colors ${
                        isSelected
                          ? "bg-[var(--color-accent-violet)]/10 text-[var(--color-text-primary)]"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                      }`}
                    >
                      <cmd.icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-[var(--color-accent-violet)]" : "text-[var(--color-text-muted)]"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{cmd.label}</p>
                        {cmd.description && (
                          <p className="text-xs text-[var(--color-text-muted)] truncate">{cmd.description}</p>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--color-border-subtle)]">
                          {cmd.shortcut}
                        </kbd>
                      )}
                      {isSelected && <ArrowRight className="h-3 w-3 text-[var(--color-accent-violet)]" />}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[var(--color-border-subtle)] text-[10px] text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1">
            <kbd className="bg-[var(--color-bg-elevated)] px-1 py-0.5 rounded border border-[var(--color-border-subtle)]">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-[var(--color-bg-elevated)] px-1 py-0.5 rounded border border-[var(--color-border-subtle)]">
              <CornerDownLeft className="h-2.5 w-2.5 inline" />
            </kbd>
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-[var(--color-bg-elevated)] px-1 py-0.5 rounded border border-[var(--color-border-subtle)]">esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  )
}
