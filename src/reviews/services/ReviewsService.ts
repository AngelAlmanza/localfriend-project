import { ISystemError } from "@/src/shared/interfaces/ISystemError"
import { Either } from "@/src/shared/types/either"
import { SupabaseClient } from "@supabase/supabase-js"
import { SearchListingType } from "@/src/locals-search/interfaces/Local"
import { Review, UserReview } from "../interfaces/Review"

export class ReviewsService {
  static async getListingReviews(
    type: SearchListingType,
    listingId: string,
    userId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, { reviews: Review[]; userReview: Review | null }>> {
    try {
      const table = type === "product" ? "product_reviews" : "service_reviews"
      const fkColumn = type === "product" ? "product_id" : "service_id"

      const { data, error } = await supabase
        .from(table)
        .select("id, rating, comment, created_at, user_id, users(name)")
        .eq(fkColumn, listingId)
        .order("created_at", { ascending: false })

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reviews: Review[] = (data ?? []).map((row: any) => ({
        id: row.id,
        authorName: row.users?.name ?? "Usuario",
        rating: Math.round(row.rating),
        comment: row.comment ?? null,
        createdAt: row.created_at,
        isOwn: row.user_id === userId,
      }))

      const userReview = reviews.find((r) => r.isOwn) ?? null

      return { right: { reviews, userReview } }
    } catch (error) {
      return { left: { message: (error as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  static async upsertReview(
    type: SearchListingType,
    listingId: string,
    userId: string,
    rating: number,
    comment: string | null,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, Review>> {
    try {
      const table = type === "product" ? "product_reviews" : "service_reviews"
      const fkColumn = type === "product" ? "product_id" : "service_id"

      const { data: existing } = await supabase
        .from(table)
        .select("id")
        .eq("user_id", userId)
        .eq(fkColumn, listingId)
        .maybeSingle()

      const selectFields = "id, rating, comment, created_at, user_id, users(name)"

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let dbError: any

      if (existing) {
        const result = await supabase
          .from(table)
          .update({ rating, comment, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
          .select(selectFields)
          .single()
        data = result.data
        dbError = result.error
      } else {
        const result = await supabase
          .from(table)
          .insert({ user_id: userId, [fkColumn]: listingId, rating, comment })
          .select(selectFields)
          .single()
        data = result.data
        dbError = result.error
      }

      if (dbError) {
        return { left: { message: dbError.message, code: dbError.code ?? "UNKNOWN_ERROR" } }
      }

      return {
        right: {
          id: data.id,
          authorName: data.users?.name ?? "Usuario",
          rating: Math.round(data.rating),
          comment: data.comment ?? null,
          createdAt: data.created_at,
          isOwn: true,
        },
      }
    } catch (error) {
      return { left: { message: (error as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  static async getUserReviews(
    userId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, UserReview[]>> {
    try {
      const [productResult, serviceResult] = await Promise.all([
        supabase
          .from("product_reviews")
          .select("id, rating, comment, created_at, product_id, products(name)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("service_reviews")
          .select("id, rating, comment, created_at, service_id, services(name)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      ])

      if (productResult.error) {
        return {
          left: {
            message: productResult.error.message,
            code: productResult.error.code ?? "UNKNOWN_ERROR",
          },
        }
      }

      if (serviceResult.error) {
        return {
          left: {
            message: serviceResult.error.message,
            code: serviceResult.error.code ?? "UNKNOWN_ERROR",
          },
        }
      }

      const reviews: UserReview[] = []

      for (const row of productResult.data ?? []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const product = row.products as any
        reviews.push({
          id: row.id,
          listingId: row.product_id,
          listingName: product?.name ?? "",
          listingType: "product",
          rating: Math.round(row.rating),
          comment: row.comment ?? null,
          createdAt: row.created_at,
        })
      }

      for (const row of serviceResult.data ?? []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const service = row.services as any
        reviews.push({
          id: row.id,
          listingId: row.service_id,
          listingName: service?.name ?? "",
          listingType: "service",
          rating: Math.round(row.rating),
          comment: row.comment ?? null,
          createdAt: row.created_at,
        })
      }

      reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      return { right: reviews }
    } catch (error) {
      return { left: { message: (error as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }
}
