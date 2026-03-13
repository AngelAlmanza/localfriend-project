import { PlansService } from "@/src/plans/services/PlansService"
import { createClient } from "@/src/shared/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json()
    const supabase = await createClient()
    const result = await PlansService.updatePlan({ ...body, id }, supabase)

    if (result.left) {
      return NextResponse.json({ error: result.left.message }, { status: 400 })
    }

    return NextResponse.json(result.right)
  } catch (err) {
    console.error("[PATCH /api/plans/:id]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
