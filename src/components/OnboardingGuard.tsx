"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"

const SKIP_PATHS = ["/onboarding", "/login", "/register", "/forgot-password", "/auth"]

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const checked = useRef(false)

  useEffect(() => {
    if (checked.current) return
    if (SKIP_PATHS.some((p) => pathname.startsWith(p))) {
      setLoading(false)
      checked.current = true
      return
    }

    const check = async () => {
      checked.current = true
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("user_profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle()

      if (!data || !data.full_name) {
        router.push("/onboarding")
      } else {
        setLoading(false)
      }
    }

    check()
  }, [router, supabase, pathname])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-8 w-64" />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
