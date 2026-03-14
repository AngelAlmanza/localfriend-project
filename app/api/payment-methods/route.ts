import { stripe } from "@/src/shared/lib/stripe/client"
import { createClient } from "@/src/shared/lib/supabase/server"
import { PaymentMethodService } from "@/src/subscriptions/services/PaymentMethodService"
import { SubscriptionsService } from "@/src/subscriptions/services/SubscriptionsService"
import { NextResponse } from "next/server"

// claude --resume f196775b-2ea9-4e25-bafb-aa87c514f960

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await PaymentMethodService.getPaymentMethods(user.id, supabase)

    if (result.left) {
      return NextResponse.json({ error: result.left.message }, { status: 500 })
    }

    return NextResponse.json({ paymentMethods: result.right })
  } catch (err) {
    console.error("[payment-methods] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const customerResult = await SubscriptionsService.getStripeCustomerId(user.id, supabase)
    if (customerResult.left || !customerResult.right) {
      return NextResponse.json({ error: "Stripe customer not found" }, { status: 400 })
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerResult.right,
      payment_method_types: ["card"],
    })

    return NextResponse.json({ clientSecret: setupIntent.client_secret })
  } catch (err) {
    console.error("[payment-methods] Error creating SetupIntent:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
