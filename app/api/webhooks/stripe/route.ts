import { Environment } from "@/src/shared/constants/Environment"
import { stripe } from "@/src/shared/lib/stripe/client"
import { createAdminClient } from "@/src/shared/lib/supabase/admin"
import { mapStripeStatusToLocal } from "@/src/subscriptions/helpers/mapStripeStatus"
import { PaymentMethodService } from "@/src/subscriptions/services/PaymentMethodService"
import { SubscriptionsService } from "@/src/subscriptions/services/SubscriptionsService"
import { NextResponse } from "next/server"
import type Stripe from "stripe"

function getSubscriptionPeriodEnd(sub: Stripe.Subscription): number {
  return sub.items.data[0]?.current_period_end ?? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  if (invoice.parent?.subscription_details?.subscription) {
    const sub = invoice.parent.subscription_details.subscription
    return typeof sub === "string" ? sub : sub.id
  }
  return null
}

function getInvoicePaymentIntentId(invoice: Stripe.Invoice): string | null {
  const payment = invoice.payments?.data?.[0]
  if (payment?.payment?.payment_intent) {
    return typeof payment.payment.payment_intent === "string"
      ? payment.payment.payment_intent
      : payment.payment.payment_intent.id
  }
  return null
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      Environment.STRIPE_WEBHOOK_SECRET,
    )
  } catch (err) {
    console.warn("[webhook] Invalid signature:", (err as Error).message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        if (!session.subscription || !session.metadata?.user_id) break

        const stripeSubId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id

        // Idempotent: check if already exists
        const existingResult = await SubscriptionsService.getSubscriptionByStripeId(stripeSubId, supabase)
        if (existingResult.right) {
          console.info("[webhook] checkout.session.completed already processed:", stripeSubId)
          break
        }

        const stripeSub = await stripe.subscriptions.retrieve(stripeSubId)
        const userId = session.metadata.user_id
        const planItem = stripeSub.items.data[0]

        // Find plan by stripe product ID
        const stripeProductId = typeof planItem.price.product === "string"
          ? planItem.price.product
          : planItem.price.product.id

        const { data: plan } = await supabase
          .from("plans")
          .select("id")
          .eq("stripe_product_id", stripeProductId)
          .single()

        if (!plan) {
          console.error("[webhook] Plan not found for product:", stripeProductId)
          break
        }

        const startDate = new Date(stripeSub.start_date * 1000).toISOString()
        const endDate = new Date(getSubscriptionPeriodEnd(stripeSub) * 1000).toISOString()

        await supabase.from("subscriptions").insert({
          user_id: userId,
          plan_id: plan.id,
          stripe_subscription_id: stripeSubId,
          status: mapStripeStatusToLocal(stripeSub.status),
          start_date: startDate,
          end_date: endDate,
        })

        // Record payment if invoice exists
        if (session.invoice) {
          const invoiceId = typeof session.invoice === "string" ? session.invoice : session.invoice.id
          const invoice = await stripe.invoices.retrieve(invoiceId, { expand: ["payments"] })
          const piId = getInvoicePaymentIntentId(invoice)

          if (piId) {
            const { data: sub } = await supabase
              .from("subscriptions")
              .select("id")
              .eq("stripe_subscription_id", stripeSubId)
              .single()

            if (sub) {
              await SubscriptionsService.createPaymentRecord({
                subscriptionId: sub.id,
                stripeInvoiceId: invoiceId,
                stripePaymentIntentId: piId,
                amount: (invoice.amount_paid ?? 0) / 100,
                currency: invoice.currency ?? "usd",
                paidAt: new Date().toISOString(),
              }, supabase)
            }
          }
        }

        // Upsert payment method
        if (session.metadata.user_id) {
          const pmId = typeof stripeSub.default_payment_method === "string"
            ? stripeSub.default_payment_method
            : stripeSub.default_payment_method?.id

          if (pmId) {
            const pm = await stripe.paymentMethods.retrieve(pmId)
            await PaymentMethodService.upsertPaymentMethod({
              userId,
              stripePaymentMethodId: pm.id,
              brand: pm.card?.brand ?? "unknown",
              last4: pm.card?.last4 ?? "0000",
              isDefault: true,
            }, supabase)
          }
        }

        console.info("[webhook] checkout.session.completed processed:", stripeSubId)
        break
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice
        const stripeSubId = getInvoiceSubscriptionId(invoice)

        if (!stripeSubId) break

        const piId = getInvoicePaymentIntentId(invoice)

        const subResult = await SubscriptionsService.getSubscriptionByStripeId(stripeSubId, supabase)
        if (subResult.left || !subResult.right) {
          console.error("[webhook] Subscription not found for invoice.paid:", stripeSubId)
          break
        }

        if (piId) {
          await SubscriptionsService.createPaymentRecord({
            subscriptionId: subResult.right.id,
            stripeInvoiceId: invoice.id,
            stripePaymentIntentId: piId,
            amount: (invoice.amount_paid ?? 0) / 100,
            currency: invoice.currency ?? "usd",
            paidAt: new Date().toISOString(),
          }, supabase)
        }

        // Update subscription end_date and status
        const stripeSub = await stripe.subscriptions.retrieve(stripeSubId)
        const endDate = new Date(getSubscriptionPeriodEnd(stripeSub) * 1000).toISOString()
        await SubscriptionsService.updateSubscriptionStatus(
          stripeSubId,
          "active",
          supabase,
          endDate,
        )

        console.info("[webhook] invoice.paid processed:", invoice.id)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        console.warn("[webhook] invoice.payment_failed:", invoice.id)
        // MVP: Log only. Stripe retries; customer.subscription.deleted handles final state.
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        // When cancel_at_period_end is true the Stripe status is still "active"/"trialing"
        // but the subscription is scheduled to cancel — map to "canceling" locally
        const localStatus = subscription.cancel_at_period_end
          ? "canceling"
          : mapStripeStatusToLocal(subscription.status)
        const endDate = new Date(getSubscriptionPeriodEnd(subscription) * 1000).toISOString()

        await SubscriptionsService.updateSubscriptionStatus(
          subscription.id,
          localStatus,
          supabase,
          endDate,
        )

        console.info("[webhook] customer.subscription.updated:", subscription.id, "→", localStatus)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        await SubscriptionsService.updateSubscriptionStatus(
          subscription.id,
          "canceled",
          supabase,
        )

        console.info("[webhook] customer.subscription.deleted:", subscription.id)
        break
      }

      default:
        console.debug("[webhook] Unhandled event type:", event.type)
    }
  } catch (err) {
    console.error("[webhook] Error processing event:", event.type, err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
