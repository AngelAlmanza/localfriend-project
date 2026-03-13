import type { Plan } from "@/src/plans/interfaces/Plan"
import { PlansService } from "@/src/plans/services/PlansService"
import { Environment } from "@/src/shared/constants/Environment"

/**
 * Fetches active plans with their active prices from Supabase REST API.
 * Uses Next.js fetch caching (revalidates every hour) to avoid repeated DB calls.
 * Uses the anon key — requires plans_anon_read + prices_anon_read RLS policies.
 */
export async function fetchActivePlans(): Promise<Plan[]> {
  const url =
    `${Environment.SUPABASE_URL}/rest/v1/plans` +
    `?select=*,prices(currency,amount,is_active,label)` +
    `&is_active=eq.true` +
    `&prices.currency=eq.USD` +
    `&prices.is_active=eq.true` +
    `&order=created_at.desc`

  try {
    const res = await fetch(url, {
      headers: {
        apikey: Environment.SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${Environment.SUPABASE_PUBLISHABLE_KEY}`,
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    })

    if (!res.ok) return []

    const data = await res.json()

    return Array.isArray(data) ? data.map(PlansService.mapToPlan) : []
  } catch {
    return []
  }
}
