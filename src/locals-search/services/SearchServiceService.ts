import { ISystemError } from "@/src/shared/interfaces/ISystemError";
import { Either } from "@/src/shared/types/either";
import { SupabaseClient } from "@supabase/supabase-js";
import { SearchResultDetail, SearchVariant } from "../interfaces/Local";

export class SearchServiceService {
  static async getServiceDetail(
    id: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, SearchResultDetail>> {
    const { data, error } = await supabase
      .from("services")
      .select(
        `id, name, description, base_price_min, base_price_max, status, created_at,
         worker_id, service_category_id,
         service_categories(id, name),
         service_variants(id, name, price_min, price_max),
         users!services_worker_id_fkey(id, name, email)`,
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
    const variants: SearchVariant[] = (row.service_variants ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((v: any) => ({
        id: v.id,
        name: v.name,
        priceMin: v.price_min,
        priceMax: v.price_max,
      }));

    const allPrices = [
      row.base_price_min,
      row.base_price_max,
      ...variants.flatMap((v) => [v.priceMin, v.priceMax]),
    ].filter((p): p is number => p != null);

    const { data: workerPrefs } = await supabase
      .from("user_preferences")
      .select("latitude, longitude")
      .eq("user_id", row.worker_id)
      .maybeSingle();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    let isFavorited = false;
    if (user) {
      const { data: fav } = await supabase
        .from("service_favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("service_id", id)
        .maybeSingle();
      isFavorited = !!fav;
    }

    return {
      right: {
        id: row.id,
        type: "service",
        name: row.name,
        description: row.description ?? null,
        categoryName: row.service_categories?.name ?? "",
        categoryId: row.service_category_id,
        workerName: row.users?.name ?? "",
        workerId: row.worker_id,
        workerEmail: row.users?.email ?? null,
        workerLatitude: workerPrefs?.latitude ?? null,
        workerLongitude: workerPrefs?.longitude ?? null,
        minPrice: allPrices.length > 0 ? Math.min(...allPrices) : null,
        maxPrice: allPrices.length > 0 ? Math.max(...allPrices) : null,
        basePriceMin: row.base_price_min,
        basePriceMax: row.base_price_max,
        isFavorited,
        createdAt: row.created_at,
        variants,
      },
    };
  }
}