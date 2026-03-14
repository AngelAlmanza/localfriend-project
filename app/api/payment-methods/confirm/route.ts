import { SubscriptionsService } from "@/src/subscriptions/services/SubscriptionsService"
import { stripe } from "@/src/shared/lib/stripe/client"
import { createClient } from "@/src/shared/lib/supabase/server"
import { NextResponse } from "next/server"
import { PaymentMethodService } from "@/src/subscriptions/services/PaymentMethodService"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { paymentMethodId } = body

    if (!paymentMethodId) {
      return NextResponse.json({ error: "paymentMethodId is required" }, { status: 400 })
    }

    // Retrieve PM from Stripe
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId)

    // Check if this is the first payment method (make it default)
    const existingResult = await PaymentMethodService.getPaymentMethods(user.id, supabase)
    const isFirst = !existingResult.right || existingResult.right.length === 0

    // Upsert locally
    await PaymentMethodService.upsertPaymentMethod({
      userId: user.id,
      stripePaymentMethodId: pm.id,
      brand: pm.card?.brand ?? "unknown",
      last4: pm.card?.last4 ?? "0000",
      isDefault: isFirst,
    }, supabase)

    // If there's an active subscription, attach PM to the customer's default
    if (isFirst) {
      const customerResult = await SubscriptionsService.getStripeCustomerId(user.id, supabase)
      if (customerResult.right) {
        await stripe.customers.update(customerResult.right, {
          invoice_settings: { default_payment_method: pm.id },
        })
      }
    }

    return NextResponse.json({
      paymentMethod: {
        stripePaymentMethodId: pm.id,
        brand: pm.card?.brand ?? "unknown",
        last4: pm.card?.last4 ?? "0000",
        isDefault: isFirst,
      },
    })
  } catch (err) {
    console.error("[payment-methods/confirm] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
