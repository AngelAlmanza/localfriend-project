import type { SubscriptionStatus } from "../interfaces/Subscription"

const stripeStatusMap: Record<string, SubscriptionStatus> = {
  active: "active",
  trialing: "trial",
  past_due: "suspended",
  canceled: "canceled",
  unpaid: "suspended",
  paused: "suspended",
}

export function mapStripeStatusToLocal(stripeStatus: string): SubscriptionStatus {
  return stripeStatusMap[stripeStatus] ?? "suspended"
}
