import { PlansService } from "@/src/plans/services/PlansService"
import { ISystemError } from "@/src/shared/interfaces/ISystemError"
import { stripe } from "@/src/shared/lib/stripe/client"
import { AppLogger } from "@/src/shared/services/AppLogger"
import { Either } from "@/src/shared/types/either"
import { SupabaseClient } from "@supabase/supabase-js"
import { mapStripeStatusToLocal } from "../helpers/mapStripeStatus"
import type {
  CreatePaymentRecordInput,
  Subscription,
  SubscriptionStatus,
} from "../interfaces/Subscription"

export class SubscriptionsService {
  static async createStripeCustomer(
    userId: string,
    email: string,
    name: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, string>> {
    try {
      // Idempotent: check if customer already exists
      const { data: user } = await supabase
        .from("users")
        .select("stripe_customer_id")
        .eq("id", userId)
        .single()

      if (user?.stripe_customer_id) {
        return { right: user.stripe_customer_id }
      }

      const customer = await stripe.customers.create({
        email,
        name,
        metadata: { user_id: userId },
      })

      const { error } = await supabase
        .from("users")
        .update({ stripe_customer_id: customer.id })
        .eq("id", userId)

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: customer.id }
    } catch (err) {
      return { left: { message: (err as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  static async getStripeCustomerId(
    userId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, string | null>> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("stripe_customer_id")
        .eq("id", userId)
        .single()

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: data.stripe_customer_id ?? null }
    } catch (err) {
      return { left: { message: (err as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  static async createTrialSubscription(
    userId: string,
    planId: string,
    stripePriceId: string,
    stripeCustomerId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, Subscription>> {
    try {
      AppLogger.log(`Creating trial subscription for user: ${userId}`)
      const stripeSubscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: stripePriceId }],
        trial_period_days: 30,
        payment_settings: {
          save_default_payment_method: "on_subscription",
        },
        metadata: { user_id: userId },
      })

      const startDate = new Date(stripeSubscription.start_date * 1000).toISOString()
      const endDate = stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

      // TODO: HERE IS THE ERROR
      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_id: planId,
          stripe_subscription_id: stripeSubscription.id,
          status: "trial",
          start_date: startDate,
          end_date: endDate,
        })
        .select("*, plans:plan_id(*, prices(*))")
        .single()


      if (error) {
        AppLogger.error(`Error creating trial subscription for user: ${userId} ${JSON.stringify(error, null, 2)}`)
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      AppLogger.log(`Supabase subscription created for user: ${userId} ${JSON.stringify(data, null, 2)}`)

      // Mark trial as used
      await supabase
        .from("users")
        .update({ has_used_trial: true })
        .eq("id", userId)

      return { right: this.mapToSubscription(data) }
    } catch (err) {
      AppLogger.error(`Error creating trial subscription for user: ${userId} ${JSON.stringify(err, null, 2)}`)
      return { left: { message: (err as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  static async getActiveSubscription(
    userId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, Subscription | null>> {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, plans:plan_id(*, prices(*))")
        .eq("user_id", userId)
        .in("status", ["trial", "active", "canceling"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: data ? this.mapToSubscription(data) : null }
    } catch (err) {
      return { left: { message: (err as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  static async getSubscriptionByStripeId(
    stripeSubscriptionId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, Subscription | null>> {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, plans:plan_id(*, prices(*))")
        .eq("stripe_subscription_id", stripeSubscriptionId)
        .maybeSingle()

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: data ? this.mapToSubscription(data) : null }
    } catch (err) {
      return { left: { message: (err as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  static async updateSubscriptionStatus(
    stripeSubscriptionId: string,
    status: SubscriptionStatus,
    supabase: SupabaseClient,
    endDate?: string,
  ): Promise<Either<ISystemError, void>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (endDate) {
        updateData.end_date = endDate
      }

      const { error } = await supabase
        .from("subscriptions")
        .update(updateData)
        .eq("stripe_subscription_id", stripeSubscriptionId)

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: undefined }
    } catch (err) {
      return { left: { message: (err as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  static async cancelSubscription(
    userId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, void>> {
    try {
      const activeResult = await this.getActiveSubscription(userId, supabase)
      if (activeResult.left) return activeResult
      if (!activeResult.right) {
        return { left: { message: "No active subscription found", code: "NOT_FOUND" } }
      }

      const subscription = activeResult.right

      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      })

      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "canceling", updated_at: new Date().toISOString() })
        .eq("id", subscription.id)

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: undefined }
    } catch (err) {
      return { left: { message: (err as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  static async reactivateSubscription(
    userId: string,
    stripePriceId: string,
    stripeCustomerId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, Subscription>> {
    try {
      // Check if there is a "canceling" subscription to resume (undo cancel_at_period_end)
      const { data: cancelingRow } = await supabase
        .from("subscriptions")
        .select("*, plans:plan_id(*, prices(*))")
        .eq("user_id", userId)
        .eq("status", "canceling")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (cancelingRow) {
        // Resume: undo cancel_at_period_end — no new charge, same period
        const stripeSub = await stripe.subscriptions.update(
          cancelingRow.stripe_subscription_id,
          { cancel_at_period_end: false },
        )

        const resumedStatus = mapStripeStatusToLocal(stripeSub.status)
        const periodEnd = stripeSub.items.data[0]?.current_period_end
        const endDate = periodEnd
          ? new Date(periodEnd * 1000).toISOString()
          : cancelingRow.end_date

        const { error } = await supabase
          .from("subscriptions")
          .update({ status: resumedStatus, end_date: endDate, updated_at: new Date().toISOString() })
          .eq("id", cancelingRow.id)

        if (error) {
          return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
        }

        return { right: this.mapToSubscription({ ...cancelingRow, status: resumedStatus, end_date: endDate }) }
      }

      // No canceling subscription — create a brand new one
      const { data: priceData } = await supabase
        .from("prices")
        .select("plan_id")
        .eq("stripe_price_id", stripePriceId)
        .single()

      if (!priceData) {
        return { left: { message: "Price not found", code: "NOT_FOUND" } }
      }

      const stripeSubscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: stripePriceId }],
        metadata: { user_id: userId },
      })

      const startDate = new Date(stripeSubscription.start_date * 1000).toISOString()
      const periodEnd = stripeSubscription.items.data[0]?.current_period_end
      const endDate = periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_id: priceData.plan_id,
          stripe_subscription_id: stripeSubscription.id,
          status: "active",
          start_date: startDate,
          end_date: endDate,
        })
        .select("*, plans:plan_id(*, prices(*))")
        .single()

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: this.mapToSubscription(data) }
    } catch (err) {
      return { left: { message: (err as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  static async createPaymentRecord(
    data: CreatePaymentRecordInput,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, void>> {
    try {
      const { error } = await supabase
        .from("subscription_payments")
        .insert({
          subscription_id: data.subscriptionId,
          stripe_invoice_id: data.stripeInvoiceId,
          stripe_payment_intent_id: data.stripePaymentIntentId,
          amount: data.amount,
          currency: data.currency,
          paid_at: data.paidAt,
        })

      // Ignore duplicate (UNIQUE constraint on stripe_payment_intent_id)
      if (error && error.code !== "23505") {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: undefined }
    } catch (err) {
      return { left: { message: (err as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapToSubscription(data: any): Subscription {
    return {
      id: data.id,
      userId: data.user_id,
      planId: data.plan_id,
      stripeSubscriptionId: data.stripe_subscription_id,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      plan: data.plans ? PlansService.mapToPlan(data.plans) : undefined,
    }
  }
}
