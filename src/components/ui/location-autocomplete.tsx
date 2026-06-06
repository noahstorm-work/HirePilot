"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MapPin, X } from "lucide-react"

interface LocationSuggestion {
  label: string
  city: string
  state: string
  country: string
  countryCode: string
}

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const POPULAR_LOCATIONS = [
  "Remote",
  "London",
  "New York",
  "San Francisco",
  "Berlin",
  "Singapore",
]

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Location",
  className = "",
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([])
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/locations/search?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      if (json.success && json.data) {
        setSuggestions(json.data)
        setIsOpen(json.data.length > 0)
      }
    } catch { /* suggestions will remain empty */ }
    setLoading(false)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    setHighlightIndex(-1)
    setLoading(true)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300)
  }

  const handleSelect = (label: string) => {
    setQuery(label)
    onChange(label)
    setIsOpen(false)
    setSuggestions([])
    inputRef.current?.blur()
  }

  const handleClear = () => {
    setQuery("")
    onChange("")
    setSuggestions([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && e.key !== "Enter") return

    const items = suggestions

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (highlightIndex >= 0 && items[highlightIndex]) {
          handleSelect(items[highlightIndex].label)
        } else if (query.trim()) {
          handleSelect(query.trim())
        }
        break
      case "Escape":
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const showChips = !value && query.length === 0

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)] pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true)
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 h-10 rounded-xl text-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] focus:outline-none transition-colors"
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Popular location chips */}
      {showChips && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {POPULAR_LOCATIONS.map((loc) => (
            <button
              key={loc}
              onClick={() => handleSelect(loc)}
              className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border-default)] transition-all"
            >
              {loc}
            </button>
          ))}
        </div>
      )}

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] shadow-lg overflow-hidden"
          role="listbox"
        >
          {suggestions.map((s, i) => (
            <button
              key={`${s.label}-${i}`}
              onClick={() => handleSelect(s.label)}
              onMouseEnter={() => setHighlightIndex(i)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors ${
                highlightIndex === i
                  ? "bg-[var(--color-accent-violet)]/10 text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
              }`}
              role="option"
              aria-selected={highlightIndex === i}
            >
              <MapPin className={`h-3 w-3 shrink-0 ${highlightIndex === i ? "text-[var(--color-accent-violet)]" : "text-[var(--color-text-muted)]"}`} />
              <span className="truncate">{s.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {loading && query.length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] shadow-lg px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent-violet)] border-t-transparent" />
            Searching locations...
          </div>
        </div>
      )}
    </div>
  )
}
