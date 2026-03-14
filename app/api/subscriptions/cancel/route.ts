import { createClient } from "@/src/shared/lib/supabase/server"
import { SubscriptionsService } from "@/src/subscriptions/services/SubscriptionsService"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await SubscriptionsService.cancelSubscription(user.id, supabase)

    if (result.left) {
      return NextResponse.json({ error: result.left.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[subscriptions/cancel] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
