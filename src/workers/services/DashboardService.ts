import { SupabaseClient } from "@supabase/supabase-js"
import { Either } from "@/src/shared/types/either"
import { ISystemError } from "@/src/shared/interfaces/ISystemError"
import {
  DashboardData,
  ViewsDataPoint,
  TopListing,
  TopContactListing,
  ChannelDistribution,
  DashboardReview,
} from "../interfaces/Dashboard"

// TODO: Refactor this service with optimized queries
export class DashboardService {
  static async getDashboardData(
    workerId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, DashboardData>> {
    try {
      const [
        viewsResult,
        topProductsResult,
        topServicesResult,
        contactsResult,
        reviewsResult,
      ] = await Promise.all([
        this.getViewsData(workerId, supabase),
        this.getTopListings(workerId, "product", supabase),
        this.getTopListings(workerId, "service", supabase),
        this.getContactsData(workerId, supabase),
        this.getRecentReviews(workerId, supabase),
      ])

      if (viewsResult.left) return { left: viewsResult.left }
      if (topProductsResult.left) return { left: topProductsResult.left }
      if (topServicesResult.left) return { left: topServicesResult.left }
      if (contactsResult.left) return { left: contactsResult.left }
      if (reviewsResult.left) return { left: reviewsResult.left }

      const views = viewsResult.right!
      const totalViews =
        views.daily.reduce((sum, d) => sum + d.products + d.services, 0)

      return {
        right: {
          views,
          topProducts: topProductsResult.right!,
          topServices: topServicesResult.right!,
          topContactListings: contactsResult.right!.topListings,
          channelDistribution: contactsResult.right!.channels,
          recentReviews: reviewsResult.right!,
          totalViews,
          totalContacts: contactsResult.right!.totalClicks,
        },
      }
    } catch (error) {
      return { left: { message: (error as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  private static async getViewsData(
    workerId: string,
    supabase: SupabaseClient,
  ): Promise<
    Either<ISystemError, { daily: ViewsDataPoint[]; weekly: ViewsDataPoint[]; monthly: ViewsDataPoint[] }>
  > {
    try {
      // Get worker's product & service IDs
      const [productsRes, servicesRes] = await Promise.all([
        supabase.from("products").select("id").eq("worker_id", workerId),
        supabase.from("services").select("id").eq("worker_id", workerId),
      ])

      if (productsRes.error) return { left: { message: productsRes.error.message, code: productsRes.error.code ?? "UNKNOWN_ERROR" } }
      if (servicesRes.error) return { left: { message: servicesRes.error.message, code: servicesRes.error.code ?? "UNKNOWN_ERROR" } }

      const productIds = (productsRes.data ?? []).map((p) => p.id)
      const serviceIds = (servicesRes.data ?? []).map((s) => s.id)

      // Fetch all views for these products/services
      const [productViewsRes, serviceViewsRes] = await Promise.all([
        productIds.length > 0
          ? supabase
            .from("product_views")
            .select("viewed_at")
            .in("product_id", productIds)
          : Promise.resolve({ data: [], error: null }),
        serviceIds.length > 0
          ? supabase
            .from("service_views")
            .select("viewed_at")
            .in("service_id", serviceIds)
          : Promise.resolve({ data: [], error: null }),
      ])

      if (productViewsRes.error) return { left: { message: productViewsRes.error.message, code: productViewsRes.error.code ?? "UNKNOWN_ERROR" } }
      if (serviceViewsRes.error) return { left: { message: serviceViewsRes.error.message, code: serviceViewsRes.error.code ?? "UNKNOWN_ERROR" } }

      const productViews = (productViewsRes.data ?? []).map((v) => new Date(v.viewed_at))
      const serviceViews = (serviceViewsRes.data ?? []).map((v) => new Date(v.viewed_at))

      return {
        right: {
          daily: this.aggregateByPeriod(productViews, serviceViews, "daily"),
          weekly: this.aggregateByPeriod(productViews, serviceViews, "weekly"),
          monthly: this.aggregateByPeriod(productViews, serviceViews, "monthly"),
        },
      }
    } catch (error) {
      return { left: { message: (error as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  private static aggregateByPeriod(
    productViews: Date[],
    serviceViews: Date[],
    period: "daily" | "weekly" | "monthly",
  ): ViewsDataPoint[] {
    const now = new Date()
    const buckets = new Map<string, { products: number; services: number }>()

    const count = period === "daily" ? 30 : period === "weekly" ? 12 : 12

    // Initialize buckets
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now)
      if (period === "daily") {
        date.setDate(date.getDate() - i)
      } else if (period === "weekly") {
        date.setDate(date.getDate() - i * 7)
      } else {
        date.setMonth(date.getMonth() - i)
      }
      const key = this.getBucketKey(date, period)
      buckets.set(key, { products: 0, services: 0 })
    }

    // Count product views
    for (const date of productViews) {
      const key = this.getBucketKey(date, period)
      const bucket = buckets.get(key)
      if (bucket) bucket.products++
    }

    // Count service views
    for (const date of serviceViews) {
      const key = this.getBucketKey(date, period)
      const bucket = buckets.get(key)
      if (bucket) bucket.services++
    }

    return Array.from(buckets.entries()).map(([label, data]) => ({
      label,
      ...data,
    }))
  }

  private static getBucketKey(date: Date, period: "daily" | "weekly" | "monthly"): string {
    if (period === "daily") {
      return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`
    } else if (period === "weekly") {
      const weekStart = new Date(date)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      return `${String(weekStart.getDate()).padStart(2, "0")}/${String(weekStart.getMonth() + 1).padStart(2, "0")}`
    } else {
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
      return `${months[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`
    }
  }

  private static async getTopListings(
    workerId: string,
    type: "product" | "service",
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, TopListing[]>> {
    try {
      const table = type === "product" ? "products" : "services"
      const viewsTable = type === "product" ? "product_views" : "service_views"
      const fkColumn = type === "product" ? "product_id" : "service_id"

      // Get worker's listings
      const { data: listings, error: listingsError } = await supabase
        .from(table)
        .select("id, name")
        .eq("worker_id", workerId)

      if (listingsError) return { left: { message: listingsError.message, code: listingsError.code ?? "UNKNOWN_ERROR" } }
      if (!listings?.length) return { right: [] }

      const listingIds = listings.map((l) => l.id)

      // Get view counts
      const { data: views, error: viewsError } = await supabase
        .from(viewsTable)
        .select(fkColumn)
        .in(fkColumn, listingIds)

      if (viewsError) return { left: { message: viewsError.message, code: viewsError.code ?? "UNKNOWN_ERROR" } }

      // Count views per listing
      const viewCounts = new Map<string, number>()
      for (const view of views ?? []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const id = (view as any)[fkColumn] as string
        viewCounts.set(id, (viewCounts.get(id) ?? 0) + 1)
      }

      // Build top 5
      const result: TopListing[] = listings
        .map((l) => ({
          id: l.id,
          name: l.name,
          views: viewCounts.get(l.id) ?? 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)

      return { right: result }
    } catch (error) {
      return { left: { message: (error as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  private static async getContactsData(
    workerId: string,
    supabase: SupabaseClient,
  ): Promise<
    Either<ISystemError, { topListings: TopContactListing[]; channels: ChannelDistribution[]; totalClicks: number }>
  > {
    try {
      // Get worker's listing IDs
      const [productsRes, servicesRes] = await Promise.all([
        supabase.from("products").select("id, name").eq("worker_id", workerId),
        supabase.from("services").select("id, name").eq("worker_id", workerId),
      ])

      if (productsRes.error) return { left: { message: productsRes.error.message, code: productsRes.error.code ?? "UNKNOWN_ERROR" } }
      if (servicesRes.error) return { left: { message: servicesRes.error.message, code: servicesRes.error.code ?? "UNKNOWN_ERROR" } }

      const products = productsRes.data ?? []
      const services = servicesRes.data ?? []
      const productIds = products.map((p) => p.id)
      const serviceIds = services.map((s) => s.id)

      if (!productIds.length && !serviceIds.length) {
        return { right: { topListings: [], channels: [], totalClicks: 0 } }
      }

      // Fetch contact clicks
      const { data: clicks, error: clicksError } = await supabase
        .from("contact_clicks")
        .select("product_id, service_id, channel")

      if (clicksError) return { left: { message: clicksError.message, code: clicksError.code ?? "UNKNOWN_ERROR" } }

      // Filter clicks for this worker's listings
      const workerClicks = (clicks ?? []).filter(
        (c) =>
          (c.product_id && productIds.includes(c.product_id)) ||
          (c.service_id && serviceIds.includes(c.service_id))
      )

      // Count by listing
      const listingCounts = new Map<string, { name: string; type: "product" | "service"; clicks: number }>()
      const channelCounts = new Map<string, number>()

      for (const click of workerClicks) {
        // Channel distribution
        channelCounts.set(click.channel, (channelCounts.get(click.channel) ?? 0) + 1)

        // Listing counts
        if (click.product_id && productIds.includes(click.product_id)) {
          const existing = listingCounts.get(click.product_id)
          if (existing) {
            existing.clicks++
          } else {
            const product = products.find((p) => p.id === click.product_id)
            listingCounts.set(click.product_id, {
              name: product?.name ?? "",
              type: "product",
              clicks: 1,
            })
          }
        }
        if (click.service_id && serviceIds.includes(click.service_id)) {
          const existing = listingCounts.get(click.service_id)
          if (existing) {
            existing.clicks++
          } else {
            const service = services.find((s) => s.id === click.service_id)
            listingCounts.set(click.service_id, {
              name: service?.name ?? "",
              type: "service",
              clicks: 1,
            })
          }
        }
      }

      const topListings: TopContactListing[] = Array.from(listingCounts.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5)

      const channels: ChannelDistribution[] = Array.from(channelCounts.entries())
        .map(([channel, count]) => ({ channel, count }))
        .sort((a, b) => b.count - a.count)

      return { right: { topListings, channels, totalClicks: workerClicks.length } }
    } catch (error) {
      return { left: { message: (error as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  private static async getRecentReviews(
    workerId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, DashboardReview[]>> {
    try {
      const [productsRes, servicesRes] = await Promise.all([
        supabase.from("products").select("id, name").eq("worker_id", workerId),
        supabase.from("services").select("id, name").eq("worker_id", workerId),
      ])

      if (productsRes.error) return { left: { message: productsRes.error.message, code: productsRes.error.code ?? "UNKNOWN_ERROR" } }
      if (servicesRes.error) return { left: { message: servicesRes.error.message, code: servicesRes.error.code ?? "UNKNOWN_ERROR" } }

      const products = productsRes.data ?? []
      const services = servicesRes.data ?? []
      const productIds = products.map((p) => p.id)
      const serviceIds = services.map((s) => s.id)

      const reviews: DashboardReview[] = []

      if (productIds.length > 0) {
        const { data, error } = await supabase
          .from("product_reviews")
          .select("id, rating, comment, created_at, product_id, users(name)")
          .in("product_id", productIds)
          .order("created_at", { ascending: false })
          .limit(10)

        if (error) return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const row of data ?? []) {
          const product = products.find((p) => p.id === row.product_id)
          reviews.push({
            id: row.id,
            listingName: product?.name ?? "",
            listingType: "product",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            authorName: (row.users as any)?.name ?? "Usuario",
            rating: Math.round(row.rating),
            comment: row.comment ?? null,
            createdAt: row.created_at,
          })
        }
      }

      if (serviceIds.length > 0) {
        const { data, error } = await supabase
          .from("service_reviews")
          .select("id, rating, comment, created_at, service_id, users(name)")
          .in("service_id", serviceIds)
          .order("created_at", { ascending: false })
          .limit(10)

        if (error) return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const row of data ?? []) {
          const service = services.find((s) => s.id === row.service_id)
          reviews.push({
            id: row.id,
            listingName: service?.name ?? "",
            listingType: "service",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            authorName: (row.users as any)?.name ?? "Usuario",
            rating: Math.round(row.rating),
            comment: row.comment ?? null,
            createdAt: row.created_at,
          })
        }
      }

      // Sort by date and take top 10
      reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      return { right: reviews.slice(0, 10) }
    } catch (error) {
      return { left: { message: (error as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }
}
