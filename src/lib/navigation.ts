import {
  LayoutDashboard, Brain, Search, Briefcase, Sparkles,
  FileCheck, Target, BarChart3, GitBranch, User
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface NavItem {
  label: string
  href: string
  icon: string
  shortcut?: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Core",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", shortcut: "⌘1" },
      { label: "Career Analysis", href: "/dashboard/career-analysis", icon: "Brain", shortcut: "⌘2" },
      { label: "Discover", href: "/discover", icon: "Search", shortcut: "⌘3" },
      { label: "Applications", href: "/applications", icon: "Briefcase", shortcut: "⌘4" },
      { label: "Profile", href: "/profile", icon: "User", shortcut: "⌘0" },
    ],
  },
  {
    title: "AI Tools",
    items: [
      { label: "Interview Coach", href: "/dashboard/interview-coach", icon: "Sparkles", shortcut: "⌘5" },
      { label: "ATS Checker", href: "/dashboard/ats-checker", icon: "FileCheck", shortcut: "⌘6" },
      { label: "Skills Gap", href: "/dashboard/skills-gap", icon: "Target", shortcut: "⌘7" },
    ],
  },
  {
    title: "Analytics",
    items: [
      { label: "Insights", href: "/dashboard/insights", icon: "BarChart3", shortcut: "⌘8" },
      { label: "CV Versions", href: "/dashboard/cv-versions", icon: "GitBranch", shortcut: "⌘9" },
    ],
  },
]

export const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Brain,
  Search,
  Briefcase,
  Sparkles,
  FileCheck,
  Target,
  BarChart3,
  GitBranch,
  User,
}

export const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap(s => s.items)
