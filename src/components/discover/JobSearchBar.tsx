"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"

interface Props {
  onSearch: (query: string, location: string) => void
  loading: boolean
}

export function JobSearchBar({ onSearch, loading }: Props) {
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) onSearch(query.trim(), location.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-1">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search job titles, skills, or companies..."
          className="h-11"
        />
      </div>
      <div className="w-48">
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="h-11"
        />
      </div>
      <Button type="submit" disabled={loading || !query.trim()} className="h-11">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        Search
      </Button>
    </form>
  )
}
