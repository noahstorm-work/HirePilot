import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const updateSchema = z.object({
  company: z.string().min(1).max(200).optional(),
  role_title: z.string().min(1).max(200).optional(),
  job_url: z.string().url().optional().or(z.literal("")),
  job_description: z.string().optional(),
  status: z.enum(["Saved", "Applied", "Interview", "Offer", "Rejected"]).optional(),
  salary_range: z.string().optional(),
  location: z.string().optional(),
  remote_type: z.string().optional(),
  match_score: z.number().int().min(0).max(100).optional(),
  cv_version_id: z.string().uuid().optional(),
  notes: z.string().optional(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("applications")
      .update(parsed.data)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data, error: null })
  } catch {
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 })
    }

    const { data: application, error } = await supabase
      .from("applications")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error || !application) {
      return NextResponse.json({ success: false, data: null, error: "Application not found" }, { status: 404 })
    }

    const { data: analysis } = await supabase
      .from("ai_results")
      .select("*")
      .eq("application_id", id)
      .single()

    const { data: rejectionAnalysis } = await supabase
      .from("rejection_analyses")
      .select("*")
      .eq("application_id", id)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        application,
        analysis: analysis ?? null,
        rejectionAnalysis: rejectionAnalysis ?? null,
      },
      error: null,
    })
  } catch {
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ success: false, data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: null, error: null })
  } catch {
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 })
  }
}
