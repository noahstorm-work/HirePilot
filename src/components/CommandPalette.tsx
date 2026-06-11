"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowRight, CornerDownLeft, Briefcase, Bookmark, Wrench } from "lucide-react"
import { ALL_NAV_ITEMS, ICON_MAP } from "@/lib/navigation"
import { createClient } from "@/lib/supabase/client"

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  section: string
  shortcut?: string
}

const DESCRIPTIONS: Record<string, string> = {
  "/dashboard": "Career overview",
  "/dashboard/career-analysis": "Run AI analysis",
  "/discover": "Search opportunities",
  "/applications": "Track pipeline",
  "/dashboard/interview-coach": "AI prep questions",
  "/dashboard/ats-checker": "Resume optimization",
  "/dashboard/skills-gap": "Track missing skills",
  "/dashboard/insights": "Career intelligence",
  "/dashboard/cv-versions": "Version history",
  "/profile": "Manage profile",
}

const commands: CommandItem[] = ALL_NAV_ITEMS.map((item) => ({
  id: item.href.replace(/\//g, "-").slice(1),
  label: item.label,
  description: DESCRIPTIONS[item.href],
  icon: ICON_MAP[item.icon],
  href: item.href,
  section: "Pages",
  shortcut: item.shortcut,
}))

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [apps, setApps] = useState<Array<{ id: string; company: string; role_title: string; status: string }>>([])
  const [savedJobs, setSavedJobs] = useState<Array<{ id: string; company: string; role_title: string }>>([])
  const [skills, setSkills] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      Promise.all([
        supabase.from("applications").select("id, company, role_title, status").eq("user_id", data.user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("saved_jobs").select("id, company, role_title").eq("user_id", data.user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("user_profiles").select("skills").eq("id", data.user.id).single(),
      ]).then(([appsRes, savedRes, profileRes]) => {
        if (appsRes.data) setApps(appsRes.data)
        if (savedRes.data) setSavedJobs(savedRes.data)
        if (profileRes.data?.skills) setSkills(profileRes.data.skills)
      })
    })
  }, [open])

  const { grouped, flatFiltered } = useMemo(() => {
    const navCommands = commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(query.toLowerCase())
    )

    const appResults: CommandItem[] = query.length > 0 ? apps.filter((a) =>
      a.company.toLowerCase().includes(query.toLowerCase()) ||
      a.role_title.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5).map((a) => ({
      id: `app-${a.id}`,
      label: `${a.role_title} at ${a.company}`,
      description: a.status,
      icon: Briefcase,
      href: `/applications/${a.id}`,
      section: "Applications",
    })) : []

    const savedJobResults: CommandItem[] = query.length > 0 ? savedJobs.filter((j) =>
      j.company.toLowerCase().includes(query.toLowerCase()) ||
      j.role_title.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5).map((j) => ({
      id: `saved-${j.id}`,
      label: `${j.role_title} at ${j.company}`,
      description: "Saved job",
      icon: Bookmark,
      href: "/discover",
      section: "Saved Jobs",
    })) : []

    const skillResults: CommandItem[] = query.length > 0 ? skills.filter((s) =>
      s.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 3).map((s) => ({
      id: `skill-${s}`,
      label: s,
      description: "Skill gap",
      icon: Wrench,
      href: "/dashboard/skills-gap",
      section: "Skills",
    })) : []

    const allCommands = [...navCommands, ...appResults, ...savedJobResults, ...skillResults]

    const grouped = allCommands.reduce((acc, cmd) => {
      if (!acc[cmd.section]) acc[cmd.section] = []
      acc[cmd.section].push(cmd)
      return acc
    }, {} as Record<string, CommandItem[]>)

    const flatFiltered = Object.values(grouped).flat()

    return { grouped, flatFiltered }
  }, [query, apps, savedJobs, skills])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("")
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- reset selection on query change
  useEffect(() => { setSelectedIndex(0) }, [query])

  // Focus trap
  useEffect(() => {
    if (!open || !dialogRef.current) return
    const dialog = dialogRef.current
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'input, button, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    function handleTrap(e: KeyboardEvent) {
      if (e.key !== "Tab") return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }

    dialog.addEventListener("keydown", handleTrap)
    return () => dialog.removeEventListener("keydown", handleTrap)
  }, [open])

  const handleSelect = useCallback((href: string) => {
    setOpen(false)
    router.push(href)
  }, [router])

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
    <div className="command-overlay" onClick={() => setOpen(false)} aria-hidden="true">
      <div
        ref={dialogRef}
        className="command-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border-subtle)]">
          <Search className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, applications, jobs, skills..."
            aria-label="Search pages, applications, jobs, and skills"
            className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
          />
          <kbd className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--color-border-subtle)]">ESC</kbd>
        </div>

        <div className="max-h-[320px] overflow-y-auto p-1.5" role="listbox" aria-label="Search results">
          {Object.entries(grouped).length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[var(--color-text-muted)]">No results found</p>
            </div>
          ) : (
            Object.entries(grouped).map(([section, items]) => (
              <div key={section} role="group" aria-label={section}>
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">{section}</p>
                {items.map((cmd) => {
                  globalIndex++
                  const isSelected = globalIndex === selectedIndex
                  return (
                    <button
                      key={cmd.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(cmd.href)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] text-left transition-colors ${
                        isSelected ? "bg-[var(--color-accent-violet)]/10 text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                      }`}
                    >
                      <cmd.icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-[var(--color-accent-violet)]" : "text-[var(--color-text-muted)]"}`} aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{cmd.label}</p>
                        {cmd.description && <p className="text-xs text-[var(--color-text-muted)] truncate">{cmd.description}</p>}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--color-border-subtle)]">{cmd.shortcut}</kbd>
                      )}
                      {isSelected && <ArrowRight className="h-3 w-3 text-[var(--color-accent-violet)]" aria-hidden="true" />}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[var(--color-border-subtle)] text-[10px] text-[var(--color-text-muted)]" aria-hidden="true">
          <span className="flex items-center gap-1">
            <kbd className="bg-[var(--color-bg-elevated)] px-1 py-0.5 rounded border border-[var(--color-border-subtle)]">↑↓</kbd> Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-[var(--color-bg-elevated)] px-1 py-0.5 rounded border border-[var(--color-border-subtle)]"><CornerDownLeft className="h-2.5 w-2.5 inline" /></kbd> Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-[var(--color-bg-elevated)] px-1 py-0.5 rounded border border-[var(--color-border-subtle)]">esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  )
}
