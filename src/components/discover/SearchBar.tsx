"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Clock, X } from "lucide-react"
import { LocationAutocomplete } from "@/components/ui/location-autocomplete"
import { PasteUrlDialog } from "@/components/discover/PasteUrlDialog"

interface SearchBarProps {
  query: string
  setQuery: (v: string) => void
  location: string
  setLocation: (v: string) => void
  onSearch: () => void
  loading: boolean
  recentSearches: string[]
  showRecent: boolean
  setShowRecent: (v: boolean) => void
  onSelectRecent: (term: string) => void
  onClearRecent: (term: string) => void
  searchInputRef: React.RefObject<HTMLInputElement | null>
  recentDropdownRef: React.RefObject<HTMLDivElement | null>
}

export function SearchBar({
  query,
  setQuery,
  location,
  setLocation,
  onSearch,
  loading,
  recentSearches,
  showRecent,
  setShowRecent,
  onSelectRecent,
  onClearRecent,
  searchInputRef,
  recentDropdownRef,
}: SearchBarProps) {
  return (
    <div className="p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]">
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          <Input
            ref={searchInputRef}
            placeholder="Job title, skills, or keywords..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowRecent(false) }}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            onFocus={() => { if (!query && recentSearches.length > 0) setShowRecent(true) }}
            className="pl-9 bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--color-border-focus)] h-10 text-sm"
          />
          {showRecent && recentSearches.length > 0 && (
            <div ref={recentDropdownRef} className="absolute z-50 w-full mt-1.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] shadow-lg overflow-hidden">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Recent searches</p>
              {recentSearches.map((term) => (
                <div key={term} className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-bg-hover)] group">
                  <Clock className="h-3 w-3 text-[var(--color-text-muted)] shrink-0" />
                  <button
                    onClick={() => onSelectRecent(term)}
                    className="flex-1 text-left text-sm text-[var(--color-text-secondary)] truncate"
                  >
                    {term}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onClearRecent(term) }}
                    aria-label={`Remove ${term} from recent searches`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-accent-rose)]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <LocationAutocomplete
          value={location}
          onChange={setLocation}
          placeholder="Location"
          className="w-full sm:w-52"
        />
        <Button onClick={onSearch} disabled={loading || !query.trim()} className="gradient-violet text-white border-0 h-10 px-5 text-sm font-semibold hover:opacity-90 shadow-glow">
          {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Search"}
        </Button>
        <PasteUrlDialog />
      </div>
    </div>
  )
}
