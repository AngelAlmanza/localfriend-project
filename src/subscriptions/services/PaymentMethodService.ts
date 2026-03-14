import { ISystemError } from "@/src/shared/interfaces/ISystemError"
import { stripe } from "@/src/shared/lib/stripe/client"
import { Either } from "@/src/shared/types/either"
import { SupabaseClient } from "@supabase/supabase-js"
import { UpsertPaymentMethodInput, UserPaymentMethod } from "../interfaces/Subscription"

export class PaymentMethodService {
  static async getPaymentMethods(
    userId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, UserPaymentMethod[]>> {
    try {
      const { data, error } = await supabase
        .from("user_payment_methods")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return {
        right: data.map((pm) => ({
          id: pm.id,
          userId: pm.user_id,
          stripePaymentMethodId: pm.stripe_payment_method_id,
          brand: pm.brand,
          last4: pm.last4,
          isDefault: pm.is_default,
        })),
      }
    } catch (err) {
      return { left: { message: (err as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  static async upsertPaymentMethod(
    data: UpsertPaymentMethodInput,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, void>> {
    try {
      if (data.isDefault) {
        // Clear other defaults
        await supabase
          .from("user_payment_methods")
          .update({ is_default: false })
          .eq("user_id", data.userId)
          .eq("is_default", true)
      }

      const { error } = await supabase
        .from("user_payment_methods")
        .upsert(
          {
            user_id: data.userId,
            stripe_payment_method_id: data.stripePaymentMethodId,
            brand: data.brand,
            last4: data.last4,
            is_default: data.isDefault,
          },
          { onConflict: "stripe_payment_method_id" },
        )

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: undefined }
    } catch (err) {
      return { left: { message: (err as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  static async removePaymentMethod(
    paymentMethodId: string,
    userId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, void>> {
    try {
      // Get the Stripe PM ID
      const { data: pm, error: fetchError } = await supabase
        .from("user_payment_methods")
        .select("stripe_payment_method_id")
        .eq("id", paymentMethodId)
        .eq("user_id", userId)
        .single()

      if (fetchError) {
        return { left: { message: fetchError.message, code: fetchError.code ?? "UNKNOWN_ERROR" } }
      }

      // Detach from Stripe
      await stripe.paymentMethods.detach(pm.stripe_payment_method_id)

      // Delete locally
      const { error } = await supabase
        .from("user_payment_methods")
        .delete()
        .eq("id", paymentMethodId)
        .eq("user_id", userId)

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: undefined }
    } catch (err) {
      return { left: { message: (err as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  static async setDefaultPaymentMethod(
    paymentMethodId: string,
    userId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, void>> {
    try {
      // Get the Stripe PM ID and customer ID
      const { data: pm, error: pmError } = await supabase
        .from("user_payment_methods")
        .select("stripe_payment_method_id")
        .eq("id", paymentMethodId)
        .eq("user_id", userId)
        .single()

      if (pmError) {
        return { left: { message: pmError.message, code: pmError.code ?? "UNKNOWN_ERROR" } }
      }

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("stripe_customer_id")
        .eq("id", userId)
        .single()

      if (userError || !user?.stripe_customer_id) {
        return { left: { message: "Stripe customer not found", code: "NOT_FOUND" } }
      }

      // Update Stripe customer default PM
      await stripe.customers.update(user.stripe_customer_id, {
        invoice_settings: {
          default_payment_method: pm.stripe_payment_method_id,
        },
      })

      // Clear other defaults
      await supabase
        .from("user_payment_methods")
        .update({ is_default: false })
        .eq("user_id", userId)
        .eq("is_default", true)

      // Set new default
      const { error } = await supabase
        .from("user_payment_methods")
        .update({ is_default: true })
        .eq("id", paymentMethodId)
        .eq("user_id", userId)

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: undefined }
    } catch (err) {
      return { left: { message: (err as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }
}