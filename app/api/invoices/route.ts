import { SubscriptionsService } from "@/src/subscriptions/services/SubscriptionsService"
import { stripe } from "@/src/shared/lib/stripe/client"
import { createClient } from "@/src/shared/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const customerResult = await SubscriptionsService.getStripeCustomerId(user.id, supabase)
    if (customerResult.left || !customerResult.right) {
      return NextResponse.json({ invoices: [] })
    }

    const invoices = await stripe.invoices.list({
      customer: customerResult.right,
      limit: 24,
    })

    const mapped = invoices.data.map((inv) => ({
      id: inv.id,
      date: inv.created ? new Date(inv.created * 1000).toISOString() : null,
      amount: (inv.amount_paid ?? 0) / 100,
      currency: inv.currency ?? "usd",
      status: inv.status,
      pdfUrl: inv.invoice_pdf ?? null,
    }))

    return NextResponse.json({ invoices: mapped })
  } catch (err) {
    console.error("[invoices] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
