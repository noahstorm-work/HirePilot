"use client"

import { useCallback } from "react"
import { MapPin } from "lucide-react"
import { AutocompleteInput } from "./autocomplete-input"

const POPULAR_LOCATIONS = [
  "Remote",
  "London",
  "New York",
  "San Francisco",
  "Berlin",
  "Singapore",
]

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Location",
  className = "",
}: LocationAutocompleteProps) {
  const fetchSuggestions = useCallback(async (q: string): Promise<string[]> => {
    if (q.length < 2) return []
    try {
      const res = await fetch(`/api/locations/search?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      if (json.success && json.data) {
        return json.data.map((s: { label: string }) => s.label)
      }
    } catch { /* suggestions will remain empty */ }
    return []
  }, [])

  return (
    <AutocompleteInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      icon={<MapPin className="h-3.5 w-3.5" />}
      fetchSuggestions={fetchSuggestions}
      popularSuggestions={POPULAR_LOCATIONS}
    />
  )
}
