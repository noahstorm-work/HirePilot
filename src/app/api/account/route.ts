import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function DELETE(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, data: null, error: "Server configuration error" }, { status: 500 })
    }

    const supabaseAuth = createClient(supabaseUrl, serviceKey)

    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 })
    }

    const { error: deleteError } = await supabaseAuth.auth.admin.deleteUser(user.id)

    if (deleteError) {
      return NextResponse.json({ success: false, data: null, error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: { deleted: true }, error: null })
  } catch {
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 })
  }
}
