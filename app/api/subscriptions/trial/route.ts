import { SubscriptionsService } from "@/src/subscriptions/services/SubscriptionsService"
import { createClient } from "@/src/shared/lib/supabase/server"
import { NextResponse } from "next/server"
import { AppLogger } from "@/src/shared/services/AppLogger"

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      AppLogger.error(`Unauthorized user: ${authError?.message}`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if trial already used
    const { data: userData } = await supabase
      .from("users")
      .select("has_used_trial, name, email")
      .eq("id", user.id)
      .single()

    if (userData?.has_used_trial) {
      AppLogger.error(`Trial already used for user: ${user.id}`)
      return NextResponse.json({ error: "Trial already used" }, { status: 400 })
    }

    // Fetch first active plan with first active USD price
    const { data: plans } = await supabase
      .from("plans")
      .select("*, prices(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1)

    if (!plans || plans.length === 0) {
      AppLogger.error("No active plan found")
      return NextResponse.json({ error: "No active plan found" }, { status: 404 })
    }

    const plan = plans[0]
    const usdPrice = plan.prices?.find(
      (p: { currency: string; is_active: boolean }) =>
        p.currency.toUpperCase() === "USD" && p.is_active,
    )

    if (!usdPrice?.stripe_price_id) {
      AppLogger.error("No active USD price found")
      return NextResponse.json({ error: "No active USD price found" }, { status: 404 })
    }

    // Create Stripe customer
    const customerResult = await SubscriptionsService.createStripeCustomer(
      user.id,
      userData?.email ?? user.email!,
      userData?.name ?? "",
      supabase,
    )

    if (customerResult.left) {
      AppLogger.error("Error creating Stripe customer")
      return NextResponse.json({ error: customerResult.left.message }, { status: 500 })
    }

    // Create trial subscription
    const subscriptionResult = await SubscriptionsService.createTrialSubscription(
      user.id,
      plan.id,
      usdPrice.stripe_price_id,
      customerResult.right,
      supabase,
    )

    if (subscriptionResult.left) {
      AppLogger.error("Error creating trial subscription")
      return NextResponse.json({ error: subscriptionResult.left.message }, { status: 500 })
    }

    AppLogger.log(`Trial created for user: ${user.id} ${JSON.stringify(subscriptionResult.right, null, 2)}`)

    return NextResponse.json({ subscription: subscriptionResult.right })
  } catch (err) {
    AppLogger.error(`[trial] Error creating trial ${JSON.stringify(err, null, 2)}`)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
