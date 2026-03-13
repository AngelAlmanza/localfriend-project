import { PlansService } from "@/src/plans/services/PlansService"
import { createClient } from "@/src/shared/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; priceId: string }> },
) {
  try {
    const { priceId } = await params
    const supabase = await createClient()
    const result = await PlansService.deactivatePrice(priceId, supabase)

    if (result.left) {
      return NextResponse.json({ error: result.left.message }, { status: 400 })
    }

    return NextResponse.json(result.right)
  } catch (err) {
    console.error("[POST /api/plans/:id/prices/:priceId/deactivate]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
