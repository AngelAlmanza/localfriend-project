import { SubscriptionsService } from "@/src/subscriptions/services/SubscriptionsService"
import { createClient } from "@/src/shared/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get Stripe customer ID
    const customerResult = await SubscriptionsService.getStripeCustomerId(user.id, supabase)
    if (customerResult.left || !customerResult.right) {
      return NextResponse.json({ error: "Stripe customer not found" }, { status: 400 })
    }

    // Fetch first active plan + first active USD price
    const { data: plans } = await supabase
      .from("plans")
      .select("*, prices(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1)

    if (!plans || plans.length === 0) {
      return NextResponse.json({ error: "No active plan found" }, { status: 404 })
    }

    const plan = plans[0]
    const usdPrice = plan.prices?.find(
      (p: { currency: string; is_active: boolean }) =>
        p.currency.toUpperCase() === "USD" && p.is_active,
    )

    if (!usdPrice?.stripe_price_id) {
      return NextResponse.json({ error: "No active USD price found" }, { status: 404 })
    }

    const result = await SubscriptionsService.reactivateSubscription(
      user.id,
      usdPrice.stripe_price_id,
      customerResult.right,
      supabase,
    )

    if (result.left) {
      return NextResponse.json({ error: result.left.message }, { status: 500 })
    }

    return NextResponse.json({ subscription: result.right })
  } catch (err) {
    console.error("[subscriptions/reactivate] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
