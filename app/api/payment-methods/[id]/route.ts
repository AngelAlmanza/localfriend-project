import { createClient } from "@/src/shared/lib/supabase/server"
import { PaymentMethodService } from "@/src/subscriptions/services/PaymentMethodService"
import { NextResponse } from "next/server"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await PaymentMethodService.removePaymentMethod(id, user.id, supabase)

    if (result.left) {
      return NextResponse.json({ error: result.left.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[payment-methods/delete] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await PaymentMethodService.setDefaultPaymentMethod(id, user.id, supabase)

    if (result.left) {
      return NextResponse.json({ error: result.left.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[payment-methods/default] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
