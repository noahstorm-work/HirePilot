"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, X } from "lucide-react"

interface SkillsStepProps {
  skills: string[]
  setSkills: (v: string[]) => void
}

const SKILL_CATEGORIES = {
  Languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin"],
  Frontend: ["React", "Next.js", "Vue", "Angular", "Svelte", "TailwindCSS", "HTML/CSS", "Redux", "Zustand"],
  Backend: ["Node.js", "Express", "Django", "Flask", "Spring Boot", "FastAPI", "GraphQL", "REST API"],
  Databases: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "DynamoDB", "Elasticsearch"],
  Cloud: ["AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "CI/CD"],
  Data: ["Machine Learning", "Data Analysis", "SQL", "Pandas", "TensorFlow", "PyTorch", "Spark"],
  Tools: ["Git", "Figma", "Jira", "Notion", "Linux", "Bash"],
}

export function SkillsStep({ skills, setSkills }: SkillsStepProps) {
  const [search, setSearch] = useState("")
  const [customSkill, setCustomSkill] = useState("")

  const grouped = useMemo(() => {
    const groups: Record<string, string[]> = {}
    for (const [cat, skillsList] of Object.entries(SKILL_CATEGORIES)) {
      const filtered = search
        ? skillsList.filter(
            (s) =>
              s.toLowerCase().includes(search.toLowerCase()) &&
              !skills.includes(s)
          )
        : skillsList.filter((s) => !skills.includes(s))
      if (filtered.length > 0) groups[cat] = filtered
    }
    return groups
  }, [search, skills])

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill))
    } else {
      setSkills([...skills, skill])
    }
  }

  const addCustomSkill = () => {
    const trimmed = customSkill.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed])
      setCustomSkill("")
    }
  }

  return (
    <div className="space-y-4 py-2">
      {skills.length > 0 && (
        <div>
          <Label className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2 block">
            Selected ({skills.length})
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <Badge
                key={skill}
                variant="primary"
                className="cursor-pointer hover:bg-[var(--color-accent-violet)]/20 transition-colors gap-1"
                onClick={() => toggleSkill(skill)}
              >
                {skill}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search skills..."
          className="pl-9 h-9 text-sm"
        />
      </div>

      <div className="flex gap-2">
        <Input
          value={customSkill}
          onChange={(e) => setCustomSkill(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addCustomSkill()
            }
          }}
          placeholder="Add custom skill..."
          className="h-9 text-sm"
        />
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors px-3 h-9 flex items-center shrink-0"
          onClick={addCustomSkill}
        >
          Add
        </Badge>
      </div>

      <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
        {Object.entries(grouped).map(([category, categorySkills]) => (
          <div key={category}>
            <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
              {category}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {categorySkills.map((skill) => (
                <Badge
                  key={skill}
                  variant={skills.includes(skill) ? "primary" : "default"}
                  className="cursor-pointer hover:border-[var(--color-accent-violet)]/40 transition-colors"
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(grouped).length === 0 && search && (
          <p className="text-xs text-[var(--color-text-muted)] text-center py-4">
            No skills matching &ldquo;{search}&rdquo;
          </p>
        )}
      </div>
    </div>
  )
}
