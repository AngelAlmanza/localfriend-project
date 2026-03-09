import { SupabaseClient } from "@supabase/supabase-js";
import { SearchResultDetail, SearchVariant } from "../interfaces/Local";
import { Either } from "@/src/shared/types/either";
import { ISystemError } from "@/src/shared/interfaces/ISystemError";

export class SearchProductService {
  static async getProductDetail(
    id: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, SearchResultDetail>> {
    const { data, error } = await supabase
      .from("products")
      .select(
        `id, name, description, is_immediate, status, created_at,
         worker_id, product_category_id,
         product_categories(id, name),
         product_variants(id, name, price),
         users!products_worker_id_fkey(id, name, email)`,
      )
      .eq("id", id)
      .eq("status", "visible")
      .single();

    if (error) {
      return {
        left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" },
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = data as any;
    const variants: SearchVariant[] = (row.product_variants ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((v: any) => ({ id: v.id, name: v.name, price: v.price }));

    const prices = variants
      .map((v) => v.price)
      .filter((p): p is number => p != null);

    // Get worker location
    const { data: workerPrefs } = await supabase
      .from("user_preferences")
      .select("latitude, longitude")
      .eq("user_id", row.worker_id)
      .maybeSingle();

    // Check if favorited
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let isFavorited = false;
    if (user) {
      const { data: fav } = await supabase
        .from("product_favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", id)
        .maybeSingle();
      isFavorited = !!fav;
    }

    return {
      right: {
        id: row.id,
        type: "product",
        name: row.name,
        description: row.description ?? null,
        categoryName: row.product_categories?.name ?? "",
        categoryId: row.product_category_id,
        workerName: row.users?.name ?? "",
        workerId: row.worker_id,
        workerEmail: row.users?.email ?? null,
        workerLatitude: workerPrefs?.latitude ?? null,
        workerLongitude: workerPrefs?.longitude ?? null,
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
        maxPrice: prices.length > 0 ? Math.max(...prices) : null,
        isImmediate: row.is_immediate,
        isFavorited,
        createdAt: row.created_at,
        variants,
      },
    };
  }
}
