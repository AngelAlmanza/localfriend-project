import { PlansService } from "@/src/plans/services/PlansService"
import { createClient } from "@/src/shared/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json()
    const supabase = await createClient()
    const result = await PlansService.addPrice({ ...body, planId: id }, supabase)

    if (result.left) {
      return NextResponse.json({ error: result.left.message }, { status: 400 })
    }

    return NextResponse.json(result.right, { status: 201 })
  } catch (err) {
    console.error("[POST /api/plans/:id/prices]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
