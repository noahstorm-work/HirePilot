"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { RichTextEditor, getEditorPlainText } from "@/components/ui/rich-text-editor"
import { Upload, Loader2 } from "lucide-react"

interface Props {
  initialCvText?: string | null
}

export function CvUploader({ initialCvText }: Props) {
  const [cvText, setCvText] = useState(initialCvText ?? "")
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSave = async () => {
    if (!getEditorPlainText(cvText).trim()) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("user_profiles").upsert({
      id: user.id,
      cv_text: cvText,
    })

    if (!error) {
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div className="space-y-3">
      <RichTextEditor
        value={cvText}
        onChange={setCvText}
        placeholder="Paste your CV text here..."
        className="min-h-[300px]"
      />
      <Button onClick={handleSave} disabled={saving || !getEditorPlainText(cvText).trim()}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Upload className="h-4 w-4 mr-1.5" />}
        Save CV
      </Button>
    </div>
  )
}
