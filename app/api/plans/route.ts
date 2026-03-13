import { PlansService } from "@/src/plans/services/PlansService"
import { createClient } from "@/src/shared/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const result = await PlansService.getPlans(supabase)

    if (result.left) {
      return NextResponse.json({ error: result.left.message }, { status: 500 })
    }

    return NextResponse.json(result.right)
  } catch (err) {
    console.error("[GET /api/plans]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createClient()
    const result = await PlansService.createPlan(body, supabase)

    if (result.left) {
      return NextResponse.json({ error: result.left.message }, { status: 400 })
    }

    return NextResponse.json(result.right, { status: 201 })
  } catch (err) {
    console.error("[POST /api/plans]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
