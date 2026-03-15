import { Either } from "@/src/shared/types/either"
import { ISystemError } from "@/src/shared/interfaces/ISystemError"
import { createAdminClient } from "@/src/shared/lib/supabase/admin"
import { stripe } from "@/src/shared/lib/stripe/client"
import {
  AdminDashboardData,
  RevenueDataPoint,
  UserStats,
  SubscriptionStats,
  PendingReport,
} from "../interfaces/AdminDashboard"

export class AdminDashboardService {
  static async getDashboardData(): Promise<Either<ISystemError, AdminDashboardData>> {
    try {
      const supabase = createAdminClient()

      const [revenueResult, userStatsResult, subStatsResult, reportsResult] =
        await Promise.all([
          this.getRevenueData(),
          this.getUserStats(supabase),
          this.getSubscriptionStats(supabase),
          this.getPendingReports(supabase),
        ])

      if (revenueResult.left) return { left: revenueResult.left }
      if (userStatsResult.left) return { left: userStatsResult.left }
      if (subStatsResult.left) return { left: subStatsResult.left }
      if (reportsResult.left) return { left: reportsResult.left }

      const revenue = revenueResult.right!
      const totalRevenue =
        revenue.monthly.reduce((sum, d) => sum + d.revenue, 0)

      return {
        right: {
          revenue,
          totalRevenue,
          userStats: userStatsResult.right!,
          subscriptionStats: subStatsResult.right!,
          pendingReports: reportsResult.right!,
        },
      }
    } catch (error) {
      return { left: { message: (error as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  private static async getRevenueData(): Promise<
    Either<ISystemError, { monthly: RevenueDataPoint[]; yearly: RevenueDataPoint[] }>
  > {
    try {
      const now = new Date()

      // --- Monthly: last 12 months ---
      const monthlyBuckets = new Map<string, number>()
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`
        monthlyBuckets.set(key, 0)
      }

      // Fetch charges from Stripe for the last 12 months
      const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
      const charges = await stripe.charges.list({
        created: { gte: Math.floor(twelveMonthsAgo.getTime() / 1000) },
        limit: 100,
      })

      // Paginate if needed
      let allCharges = charges.data
      let hasMore = charges.has_more
      let lastId = charges.data[charges.data.length - 1]?.id

      while (hasMore && lastId) {
        const more = await stripe.charges.list({
          created: { gte: Math.floor(twelveMonthsAgo.getTime() / 1000) },
          limit: 100,
          starting_after: lastId,
        })
        allCharges = allCharges.concat(more.data)
        hasMore = more.has_more
        lastId = more.data[more.data.length - 1]?.id
      }

      // Aggregate successful charges by month
      for (const charge of allCharges) {
        if (charge.status !== "succeeded") continue
        const d = new Date(charge.created * 1000)
        const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`
        const current = monthlyBuckets.get(key)
        if (current !== undefined) {
          // Convert from cents to currency units
          monthlyBuckets.set(key, current + charge.amount / 100)
        }
      }

      const monthly: RevenueDataPoint[] = Array.from(monthlyBuckets.entries()).map(
        ([label, revenue]) => ({ label, revenue })
      )

      // --- Yearly: aggregate monthly into years ---
      const yearlyBuckets = new Map<string, number>()
      for (const charge of allCharges) {
        if (charge.status !== "succeeded") continue
        const year = new Date(charge.created * 1000).getFullYear().toString()
        yearlyBuckets.set(year, (yearlyBuckets.get(year) ?? 0) + charge.amount / 100)
      }

      // Ensure at least current year exists
      const currentYear = now.getFullYear().toString()
      if (!yearlyBuckets.has(currentYear)) {
        yearlyBuckets.set(currentYear, 0)
      }

      const yearly: RevenueDataPoint[] = Array.from(yearlyBuckets.entries())
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([label, revenue]) => ({ label, revenue }))

      return { right: { monthly, yearly } }
    } catch (error) {
      return { left: { message: (error as Error).message, code: "STRIPE_ERROR" } }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static async getUserStats(supabase: any): Promise<Either<ISystemError, UserStats>> {
    try {
      const [workersRes, localsRes] = await Promise.all([
        supabase
          .from("users")
          .select("id", { count: "exact", head: true })
          .eq("role", "worker")
          .eq("is_active", true),
        supabase
          .from("users")
          .select("id", { count: "exact", head: true })
          .eq("role", "local")
          .eq("is_active", true),
      ])

      if (workersRes.error) {
        return { left: { message: workersRes.error.message, code: workersRes.error.code ?? "UNKNOWN_ERROR" } }
      }
      if (localsRes.error) {
        return { left: { message: localsRes.error.message, code: localsRes.error.code ?? "UNKNOWN_ERROR" } }
      }

      return {
        right: {
          activeWorkers: workersRes.count ?? 0,
          activeLocals: localsRes.count ?? 0,
        },
      }
    } catch (error) {
      return { left: { message: (error as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static async getSubscriptionStats(supabase: any): Promise<Either<ISystemError, SubscriptionStats>> {
    try {
      const [trialRes, activeRes] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("id", { count: "exact", head: true })
          .eq("status", "trial"),
        supabase
          .from("subscriptions")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
      ])

      if (trialRes.error) {
        return { left: { message: trialRes.error.message, code: trialRes.error.code ?? "UNKNOWN_ERROR" } }
      }
      if (activeRes.error) {
        return { left: { message: activeRes.error.message, code: activeRes.error.code ?? "UNKNOWN_ERROR" } }
      }

      return {
        right: {
          trialCount: trialRes.count ?? 0,
          activeCount: activeRes.count ?? 0,
        },
      }
    } catch (error) {
      return { left: { message: (error as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static async getPendingReports(supabase: any): Promise<Either<ISystemError, PendingReport[]>> {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          id, reason, created_at,
          reporter:users!reports_reporter_id_fkey(name),
          reported_user:users!reports_reported_user_id_fkey(name),
          products(name),
          services(name)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reports: PendingReport[] = (data ?? []).map((row: any) => {
        const reporter = Array.isArray(row.reporter) ? row.reporter[0] : row.reporter
        const reportedUser = Array.isArray(row.reported_user) ? row.reported_user[0] : row.reported_user
        const product = Array.isArray(row.products) ? row.products[0] : row.products
        const service = Array.isArray(row.services) ? row.services[0] : row.services

        let targetName = ""
        let targetType: "product" | "service" | "user" = "user"

        if (product?.name) {
          targetName = product.name
          targetType = "product"
        } else if (service?.name) {
          targetName = service.name
          targetType = "service"
        } else if (reportedUser?.name) {
          targetName = reportedUser.name
          targetType = "user"
        }

        return {
          id: row.id,
          reason: row.reason,
          reporterName: reporter?.name ?? "Usuario",
          targetName,
          targetType,
          createdAt: row.created_at,
        }
      })

      return { right: reports }
    } catch (error) {
      return { left: { message: (error as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }
}
