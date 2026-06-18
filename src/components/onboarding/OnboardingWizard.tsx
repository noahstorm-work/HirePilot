"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Check, Loader2, Rocket } from "lucide-react"
import { toast } from "sonner"
import { logError } from "@/lib/error-service"
import { WelcomeStep } from "./steps/WelcomeStep"
import { BasicInfoStep } from "./steps/BasicInfoStep"
import { SkillsStep } from "./steps/SkillsStep"
import { CvStep } from "./steps/CvStep"
import { CompleteStep } from "./steps/CompleteStep"

const STORAGE_KEY = "hirepilot-onboarding"

const STEPS = [
  { id: "welcome", label: "Welcome" },
  { id: "basic", label: "Basic Info" },
  { id: "skills", label: "Skills" },
  { id: "cv", label: "CV" },
  { id: "complete", label: "Complete" },
]

interface OnboardingState {
  step: number
  fullName: string
  targetRole: string
  yearsExperience: string
  seniority: string
  skills: string[]
  cvText: string
}

const initialState: OnboardingState = {
  step: 0,
  fullName: "",
  targetRole: "",
  yearsExperience: "",
  seniority: "",
  skills: [],
  cvText: "",
}

function loadState(): OnboardingState {
  if (typeof window === "undefined") return initialState
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...initialState, ...parsed, step: Math.min(parsed.step || 0, STEPS.length - 1) }
    }
  } catch { /* ignore */ }
  return initialState
}

function saveState(state: OnboardingState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
}

export function OnboardingWizard() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [state, setState] = useState<OnboardingState>(initialState)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    setState(loadState())
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading) saveState(state)
  }, [state, loading])

  const update = useCallback((partial: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...partial }))
  }, [])

  const canProceed = () => {
    switch (state.step) {
      case 0: return true
      case 1: return state.fullName.trim().length > 0
      case 2: return true
      case 3: return true
      case 4: return true
      default: return true
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Not authenticated")
        return
      }

      const { error } = await supabase.from("user_profiles").upsert({
        id: user.id,
        full_name: state.fullName || null,
        target_role: state.targetRole || null,
        years_experience: state.yearsExperience ? parseInt(state.yearsExperience) : null,
        target_seniority: state.seniority || null,
        skills: state.skills,
        cv_text: state.cvText || null,
      }, { onConflict: "id" })

      if (error) {
        toast.error("Failed to save profile")
        logError("Onboarding save failed", error.message, "onboarding-submit")
        return
      }

      clearState()
      update({ step: 4 })
      toast.success("Profile saved!")
    } catch {
      toast.error("Something went wrong")
    }
    setSubmitting(false)
  }

  const handleComplete = () => {
    router.push("/dashboard")
  }

  const goNext = () => {
    if (state.step === STEPS.length - 2) {
      handleSubmit()
    } else {
      update({ step: Math.min(state.step + 1, STEPS.length - 1) })
    }
  }

  const goBack = () => {
    update({ step: Math.max(state.step - 1, 0) })
  }

  const skipToEnd = () => {
    update({ step: STEPS.length - 1 })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-[var(--color-border-subtle)] border-t-[var(--color-accent-violet)] animate-spin" />
          <p className="text-xs text-[var(--color-text-muted)]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                  i < state.step
                    ? "bg-[var(--color-accent-emerald)] text-white"
                    : i === state.step
                      ? "gradient-violet text-white shadow-glow"
                      : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]"
                }`}
              >
                {i < state.step ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <span className="text-[10px] text-[var(--color-text-muted)] hidden sm:block truncate">
                  {s.label}
                </span>
              )}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px flex-1 transition-colors ${i < state.step ? "bg-[var(--color-accent-emerald)]" : "bg-[var(--color-border-subtle)]"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <Card className="p-6">
        {state.step === 0 && <WelcomeStep />}
        {state.step === 1 && (
          <BasicInfoStep
            fullName={state.fullName}
            setFullName={(v) => update({ fullName: v })}
            targetRole={state.targetRole}
            setTargetRole={(v) => update({ targetRole: v })}
            yearsExperience={state.yearsExperience}
            setYearsExperience={(v) => update({ yearsExperience: v })}
            seniority={state.seniority}
            setSeniority={(v) => update({ seniority: v })}
          />
        )}
        {state.step === 2 && (
          <SkillsStep
            skills={state.skills}
            setSkills={(v) => update({ skills: v })}
          />
        )}
        {state.step === 3 && (
          <CvStep
            cvText={state.cvText}
            setCvText={(v) => update({ cvText: v })}
          />
        )}
        {state.step === 4 && (
          <CompleteStep
            fullName={state.fullName}
            skills={state.skills}
            cvText={state.cvText}
          />
        )}
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          {state.step > 0 && state.step < STEPS.length - 1 && (
            <Button
              variant="ghost"
              onClick={goBack}
              disabled={submitting}
              className="gap-1.5 text-[var(--color-text-tertiary)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {state.step < STEPS.length - 2 && (
            <Button
              variant="ghost"
              onClick={skipToEnd}
              className="text-[var(--color-text-muted)] text-xs"
            >
              Skip
            </Button>
          )}

          {state.step < STEPS.length - 1 ? (
            <Button
              onClick={goNext}
              disabled={!canProceed() || submitting}
              className="gradient-violet text-white border-0 px-5 h-9 text-sm font-semibold hover:opacity-90 shadow-glow group"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : state.step === STEPS.length - 2 ? (
                <>
                  Complete Setup
                  <Check className="h-3.5 w-3.5 ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="gradient-violet text-white border-0 px-5 h-9 text-sm font-semibold hover:opacity-90 shadow-glow group"
            >
              Go to Dashboard
              <Rocket className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
