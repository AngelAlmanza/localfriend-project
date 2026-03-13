import { ISystemError } from "@/src/shared/interfaces/ISystemError"
import { stripe } from "@/src/shared/lib/stripe/client"
import { Either } from "@/src/shared/types/either"
import { SupabaseClient } from "@supabase/supabase-js"
import type { AddPriceInput, CreatePlanInput, Plan, Price, UpdatePlanInput } from "../interfaces/Plan"

export class PlansService {
  static async getPlans(supabase: SupabaseClient): Promise<Either<ISystemError, Plan[]>> {
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("*, prices(*)")
        .order("created_at", { ascending: false })

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: data.map(this.mapToPlan) }
    } catch (err) {
      return { left: { message: (err as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  static async getPlanById(id: string, supabase: SupabaseClient): Promise<Either<ISystemError, Plan>> {
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("*, prices(*)")
        .eq("id", id)
        .single()

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: this.mapToPlan(data) }
    } catch (err) {
      return { left: { message: (err as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  static async createPlan(
    input: CreatePlanInput,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, Plan>> {
    try {
      // Create Stripe product
      const stripeProduct = await stripe.products.create({
        name: input.name,
        description: input.description ?? undefined,
        metadata: { billing_interval: input.billingInterval },
      })

      const { data, error } = await supabase
        .from("plans")
        .insert({
          name: input.name,
          description: input.description ?? null,
          features: input.features,
          billing_interval: input.billingInterval,
          stripe_product_id: stripeProduct.id,
          is_active: true,
        })
        .select("*, prices(*)")
        .single()

      if (error) {
        // Rollback Stripe product
        await stripe.products.update(stripeProduct.id, { active: false })
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: this.mapToPlan(data) }
    } catch (err) {
      return { left: { message: (err as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  static async updatePlan(
    input: UpdatePlanInput,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, Plan>> {
    try {
      // Fetch current plan for stripe_product_id
      const { data: existing, error: fetchError } = await supabase
        .from("plans")
        .select("stripe_product_id")
        .eq("id", input.id)
        .single()

      if (fetchError) {
        return { left: { message: fetchError.message, code: fetchError.code ?? "UNKNOWN_ERROR" } }
      }

      // Sync to Stripe
      if (existing.stripe_product_id) {
        await stripe.products.update(existing.stripe_product_id, {
          name: input.name,
          description: input.description ?? undefined,
          active: input.isActive,
        })
      }

      const { data, error } = await supabase
        .from("plans")
        .update({
          name: input.name,
          description: input.description ?? null,
          features: input.features,
          billing_interval: input.billingInterval,
          is_active: input.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.id)
        .select("*, prices(*)")
        .single()

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: this.mapToPlan(data) }
    } catch (err) {
      return { left: { message: (err as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  static async addPrice(
    input: AddPriceInput,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, Price>> {
    try {
      // Fetch the plan's stripe_product_id
      const { data: plan, error: planError } = await supabase
        .from("plans")
        .select("stripe_product_id, billing_interval")
        .eq("id", input.planId)
        .single()

      if (planError) {
        return { left: { message: planError.message, code: planError.code ?? "UNKNOWN_ERROR" } }
      }

      // Deactivate any existing active price for this currency
      const { data: existingActivePrices } = await supabase
        .from("prices")
        .select("id, stripe_price_id")
        .eq("plan_id", input.planId)
        .eq("currency", input.currency)
        .eq("is_active", true)

      if (existingActivePrices && existingActivePrices.length > 0) {
        for (const existing of existingActivePrices) {
          if (existing.stripe_price_id) {
            await stripe.prices.update(existing.stripe_price_id, { active: false })
          }
        }
        await supabase
          .from("prices")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("plan_id", input.planId)
          .eq("currency", input.currency)
          .eq("is_active", true)
      }

      let stripePriceId: string | null = null

      if (plan.stripe_product_id) {
        const stripePrice = await stripe.prices.create({
          product: plan.stripe_product_id,
          unit_amount: Math.round(input.amount * 100), // Stripe uses cents
          currency: input.currency.toLowerCase(),
          recurring: {
            interval: (plan.billing_interval as "month" | "year") ?? "month",
          },
          nickname: input.label ?? undefined,
        })
        stripePriceId = stripePrice.id
      }

      const { data, error } = await supabase
        .from("prices")
        .insert({
          plan_id: input.planId,
          amount: input.amount,
          currency: input.currency,
          label: input.label ?? null,
          stripe_price_id: stripePriceId,
          is_active: true,
        })
        .select("*")
        .single()

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: this.mapToPrice(data) }
    } catch (err) {
      return { left: { message: (err as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  static async deactivatePrice(
    priceId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, Price>> {
    try {
      // Fetch current price for stripe_price_id
      const { data: existing, error: fetchError } = await supabase
        .from("prices")
        .select("stripe_price_id")
        .eq("id", priceId)
        .single()

      if (fetchError) {
        return { left: { message: fetchError.message, code: fetchError.code ?? "UNKNOWN_ERROR" } }
      }

      // Deactivate in Stripe (prices can't be deleted)
      if (existing.stripe_price_id) {
        await stripe.prices.update(existing.stripe_price_id, { active: false })
      }

      const { data, error } = await supabase
        .from("prices")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", priceId)
        .select("*")
        .single()

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: this.mapToPrice(data) }
    } catch (err) {
      return { left: { message: (err as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapToPlan(data: any): Plan {
    return {
      id: data.id,
      name: data.name,
      description: data.description ?? null,
      features: Array.isArray(data.features) ? data.features : [],
      stripeProductId: data.stripe_product_id ?? null,
      billingInterval: data.billing_interval ?? "month",
      isActive: data.is_active ?? true,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      prices: Array.isArray(data.prices) ? data.prices.map(PlansService.mapToPrice) : [],
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapToPrice(data: any): Price {
    return {
      id: data.id,
      planId: data.plan_id,
      stripePriceId: data.stripe_price_id ?? null,
      amount: data.amount,
      currency: data.currency,
      label: data.label ?? null,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }
}
