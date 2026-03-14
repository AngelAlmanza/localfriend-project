import type { Plan } from "@/src/plans/interfaces/Plan"

export type SubscriptionStatus = "trial" | "active" | "canceling" | "expired" | "canceled" | "suspended"

export interface Subscription {
  id: string
  userId: string
  planId: string
  stripeSubscriptionId: string
  status: SubscriptionStatus
  startDate: string
  endDate: string
  plan?: Plan
}

export interface SubscriptionPayment {
  id: string
  subscriptionId: string
  stripeInvoiceId: string | null
  stripePaymentIntentId: string | null
  amount: number
  currency: string
  paidAt: string
}

export interface UserPaymentMethod {
  id: string
  userId: string
  stripePaymentMethodId: string
  brand: string
  last4: string
  isDefault: boolean
}

export interface CreatePaymentRecordInput {
  subscriptionId: string
  stripeInvoiceId: string | null
  stripePaymentIntentId: string | null
  amount: number
  currency: string
  paidAt: string
}

export interface UpsertPaymentMethodInput {
  userId: string
  stripePaymentMethodId: string
  brand: string
  last4: string
  isDefault: boolean
}
