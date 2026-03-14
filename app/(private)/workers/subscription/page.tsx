import { stripe } from "@/src/shared/lib/stripe/client"
import { createClient } from "@/src/shared/lib/supabase/server"
import { CancelSubscriptionDialog } from "@/src/subscriptions/components/CancelSubscriptionDialog"
import { ExpiredSubscriptionAlert } from "@/src/subscriptions/components/ExpiredSubscriptionAlert"
import { InvoicesList } from "@/src/subscriptions/components/InvoicesList"
import { PaymentMethodsSection } from "@/src/subscriptions/components/PaymentMethodsSection"
import { ReactivateSubscriptionCard } from "@/src/subscriptions/components/ReactivateSubscriptionCard"
import { SubscriptionStatusCard } from "@/src/subscriptions/components/SubscriptionStatusCard"
import type { Subscription, UserPaymentMethod } from "@/src/subscriptions/interfaces/Subscription"
import { PaymentMethodService } from "@/src/subscriptions/services/PaymentMethodService"
import { SubscriptionsService } from "@/src/subscriptions/services/SubscriptionsService"
import moment from "moment-timezone"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"

interface Invoice {
  id: string
  date: string | null
  amount: number
  currency: string
  status: string | null
  pdfUrl: string | null
}

export default async function SubscriptionPage() {
  const t = await getTranslations("Subscriptions.page")
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let subscription: Subscription | null = null
  let paymentMethods: UserPaymentMethod[] = []
  let invoices: Invoice[] = []

  if (!user) {
    redirect("/auth/login")
  }

  const [subResult, pmResult] = await Promise.all([
    SubscriptionsService.getActiveSubscription(user.id, supabase),
    PaymentMethodService.getPaymentMethods(user.id, supabase),
  ])

  if (subResult.right !== undefined) subscription = subResult.right
  if (pmResult.right) paymentMethods = pmResult.right

  const customerResult = await SubscriptionsService.getStripeCustomerId(user.id, supabase)
  if (customerResult.right) {
    const stripeInvoices = await stripe.invoices.list({
      customer: customerResult.right,
      limit: 24,
    })
    invoices = stripeInvoices.data.map((inv) => ({
      id: inv.id,
      date: inv.created ? moment.unix(inv.created).format("YYYY-MM-DD") : null,
      amount: (inv.amount_paid ?? 0) / 100,
      currency: inv.currency ?? "usd",
      status: inv.status ?? null,
      pdfUrl: inv.invoice_pdf ?? null,
    }))
  }

  const isExpiredOrCanceled =
    !subscription ||
    subscription.status === "expired" ||
    subscription.status === "canceled"

  const isCanceling = subscription?.status === "canceling"

  const showCancelButton =
    subscription?.status === "trial" || subscription?.status === "active"

  const hasPaymentMethod = paymentMethods.length > 0

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {isExpiredOrCanceled && (
        <ExpiredSubscriptionAlert hasPaymentMethod={hasPaymentMethod} />
      )}

      {subscription && <SubscriptionStatusCard subscription={subscription} />}

      {isExpiredOrCanceled && (
        <ReactivateSubscriptionCard hasPaymentMethod={hasPaymentMethod} />
      )}

      {isCanceling && (
        <ReactivateSubscriptionCard hasPaymentMethod={hasPaymentMethod} isCanceling />
      )}

      <section className="w-full grid grid-cols-2 gap-4">
        <PaymentMethodsSection paymentMethods={paymentMethods} />
        <InvoicesList invoices={invoices} />
      </section>

      {showCancelButton && <CancelSubscriptionDialog />}
    </div>
  )
}
