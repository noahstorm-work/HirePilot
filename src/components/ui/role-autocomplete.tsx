"use client"

import { useCallback } from "react"
import { AutocompleteInput } from "./autocomplete-input"
import { Briefcase } from "lucide-react"

const POPULAR_ROLES = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Developer",
  "Product Manager",
  "Data Scientist",
]

interface RoleAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
}

export function RoleAutocomplete({
  value,
  onChange,
  placeholder = "Role title",
  className,
  id,
}: RoleAutocompleteProps) {
  const fetchSuggestions = useCallback(async (q: string) => {
    try {
      const res = await fetch(`/api/autocomplete/roles?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      return json.success ? json.data : []
    } catch { return [] }
  }, [])

  return (
    <AutocompleteInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      id={id}
      icon={<Briefcase className="h-3.5 w-3.5" />}
      fetchSuggestions={fetchSuggestions}
      popularSuggestions={POPULAR_ROLES}
    />
  )
}
