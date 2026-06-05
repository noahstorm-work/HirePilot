"use client"

import { useCallback } from "react"
import { AutocompleteInput } from "./autocomplete-input"
import { Building2 } from "lucide-react"

interface CompanyAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function CompanyAutocomplete({
  value,
  onChange,
  placeholder = "Company name",
  className,
}: CompanyAutocompleteProps) {
  const fetchSuggestions = useCallback(async (q: string) => {
    const res = await fetch(`/api/autocomplete/companies?q=${encodeURIComponent(q)}`)
    const json = await res.json()
    return json.success ? json.data : []
  }, [])

  return (
    <AutocompleteInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      icon={<Building2 className="h-3.5 w-3.5" />}
      fetchSuggestions={fetchSuggestions}
    />
  )
}
