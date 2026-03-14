import { SubscriptionsService } from "@/src/subscriptions/services/SubscriptionsService"
import { createClient } from "@/src/shared/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await SubscriptionsService.getActiveSubscription(user.id, supabase)

    if (result.left) {
      return NextResponse.json({ error: result.left.message }, { status: 500 })
    }

    return NextResponse.json({ subscription: result.right })
  } catch (err) {
    console.error("[subscriptions] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
