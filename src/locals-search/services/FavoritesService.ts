import { ISystemError } from "@/src/shared/interfaces/ISystemError";
import { Either } from "@/src/shared/types/either";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  FavoriteItem,
  RecentlyViewedItem,
  SearchVariant,
} from "../interfaces/Local";

const RECENT_DAYS = 15;

export class FavoritesService {
  static async toggleFavorite(
    type: "product" | "service",
    listingId: string,
    userId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, boolean>> {
    try {
      const table =
        type === "product" ? "product_favorites" : "service_favorites";
      const fkColumn = type === "product" ? "product_id" : "service_id";

      const { data: existing } = await supabase
        .from(table)
        .select("id")
        .eq("user_id", userId)
        .eq(fkColumn, listingId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq("id", existing.id);
        if (error) {
          return {
            left: {
              message: error.message,
              code: error.code ?? "UNKNOWN_ERROR",
            },
          };
        }
        return { right: false }; // unfavorited
      }

      const { error } = await supabase.from(table).insert({
        user_id: userId,
        [fkColumn]: listingId,
      });

      if (error) {
        return {
          left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" },
        };
      }

      return { right: true }; // favorited
    } catch (error) {
      return {
        left: { message: (error as Error).message, code: "UNKNOWN_ERROR" },
      };
    }
  }

  static async getFavoritesId(
    userId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, { productIds: string[]; serviceIds: string[] }>> {
    try {
      const [{ data: productFavs, error: pError }, { data: serviceFavs, error: sError }] =
        await Promise.all([
          supabase
            .from("product_favorites")
            .select("product_id")
            .eq("user_id", userId),
          supabase
            .from("service_favorites")
            .select("service_id")
            .eq("user_id", userId),
        ]);

      if (pError) {
        return { left: { message: pError.message, code: pError.code ?? "UNKNOWN_ERROR" } };
      }

      if (sError) {
        return { left: { message: sError.message, code: sError.code ?? "UNKNOWN_ERROR" } };
      }

      return {
        right: {
          productIds: (productFavs ?? []).map((p) => p.product_id),
          serviceIds: (serviceFavs ?? []).map((s) => s.service_id),
        },
      };
    } catch (error) {
      return {
        left: { message: (error as Error).message, code: "UNKNOWN_ERROR" },
      };
    }
  }

  static async getFavorites(
    userId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, FavoriteItem[]>> {
    try {
      const favorites: FavoriteItem[] = [];

      // Product favorites
      const { data: productFavs, error: pError } = await supabase
        .from("product_favorites")
        .select(
          `id, created_at, product_id,
           products(id, name, description, status,
             product_categories(name),
             product_variants(id, name, price),
             users!products_worker_id_fkey(name)
           )`,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (pError) {
        return {
          left: {
            message: pError.message,
            code: pError.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      for (const fav of productFavs ?? []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = fav.products as any;
        if (!p || p.status !== "visible") continue;

        const variants: SearchVariant[] = (p.product_variants ?? [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((v: any) => ({ id: v.id, name: v.name, price: v.price }));

        const prices = variants
          .map((v) => v.price)
          .filter((pr): pr is number => pr != null);

        favorites.push({
          id: fav.id,
          type: "product",
          listingId: fav.product_id,
          name: p.name,
          description: p.description ?? null,
          categoryName: p.product_categories?.name ?? "",
          workerName: p.users?.name ?? "",
          minPrice: prices.length > 0 ? Math.min(...prices) : null,
          maxPrice: prices.length > 0 ? Math.max(...prices) : null,
          createdAt: fav.created_at,
          variants,
        });
      }

      // Service favorites
      const { data: serviceFavs, error: sError } = await supabase
        .from("service_favorites")
        .select(
          `id, created_at, service_id,
           services(id, name, description, base_price_min, base_price_max, status,
             service_categories(name),
             service_variants(id, name, price_min, price_max),
             users!services_worker_id_fkey(name)
           )`,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (sError) {
        return {
          left: {
            message: sError.message,
            code: sError.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      for (const fav of serviceFavs ?? []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const s = fav.services as any;
        if (!s || s.status !== "visible") continue;

        const variants: SearchVariant[] = (s.service_variants ?? [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((v: any) => ({
            id: v.id,
            name: v.name,
            priceMin: v.price_min,
            priceMax: v.price_max,
          }));

        const allPrices = [
          s.base_price_min,
          s.base_price_max,
          ...variants.flatMap((v) => [v.priceMin, v.priceMax]),
        ].filter((p): p is number => p != null);

        favorites.push({
          id: fav.id,
          type: "service",
          listingId: fav.service_id,
          name: s.name,
          description: s.description ?? null,
          categoryName: s.service_categories?.name ?? "",
          workerName: s.users?.name ?? "",
          minPrice: allPrices.length > 0 ? Math.min(...allPrices) : null,
          maxPrice: allPrices.length > 0 ? Math.max(...allPrices) : null,
          createdAt: fav.created_at,
          variants,
        });
      }

      // Sort by createdAt descending
      favorites.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return { right: favorites };
    } catch (error) {
      return {
        left: { message: (error as Error).message, code: "UNKNOWN_ERROR" },
      };
    }
  }

  /**
   * Returns recently viewed items, excluding any already in favorites.
   * Pass `exclude` with the IDs already fetched by `getFavorites` to avoid
   * redundant round-trips to the database.
   */
  static async getRecentlyViewed(
    userId: string,
    supabase: SupabaseClient,
    exclude?: { productIds?: string[]; serviceIds?: string[] },
  ): Promise<Either<ISystemError, RecentlyViewedItem[]>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - RECENT_DAYS);
      const cutoff = cutoffDate.toISOString();

      const favProductIds = new Set(exclude?.productIds ?? []);
      const favServiceIds = new Set(exclude?.serviceIds ?? []);

      const [productViewsResult, serviceViewsResult] = await Promise.all([
        supabase
          .from("product_views")
          .select(
            `viewed_at, product_id,
             products(id, name, description, status,
               product_categories(name),
               product_variants(id, name, price),
               users!products_worker_id_fkey(name)
             )`,
          )
          .eq("user_id", userId)
          .gte("viewed_at", cutoff)
          .order("viewed_at", { ascending: false }),
        supabase
          .from("service_views")
          .select(
            `viewed_at, service_id,
             services(id, name, description, base_price_min, base_price_max, status,
               service_categories(name),
               service_variants(id, name, price_min, price_max),
               users!services_worker_id_fkey(name)
             )`,
          )
          .eq("user_id", userId)
          .gte("viewed_at", cutoff)
          .order("viewed_at", { ascending: false }),
      ]);

      if (productViewsResult.error) {
        return {
          left: {
            message: productViewsResult.error.message,
            code: productViewsResult.error.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      if (serviceViewsResult.error) {
        return {
          left: {
            message: serviceViewsResult.error.message,
            code: serviceViewsResult.error.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      const items: RecentlyViewedItem[] = [];

      const seenProductIds = new Set<string>();
      for (const view of productViewsResult.data ?? []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = view.products as any;
        if (!p || p.status !== "visible") continue;
        if (favProductIds.has(view.product_id)) continue;
        if (seenProductIds.has(view.product_id)) continue;
        seenProductIds.add(view.product_id);

        const variants: SearchVariant[] = (p.product_variants ?? [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((v: any) => ({ id: v.id, name: v.name, price: v.price }));

        const prices = variants
          .map((v) => v.price)
          .filter((pr): pr is number => pr != null);

        items.push({
          type: "product",
          listingId: view.product_id,
          name: p.name,
          description: p.description ?? null,
          categoryName: p.product_categories?.name ?? "",
          workerName: p.users?.name ?? "",
          minPrice: prices.length > 0 ? Math.min(...prices) : null,
          maxPrice: prices.length > 0 ? Math.max(...prices) : null,
          viewedAt: view.viewed_at,
          variants,
        });
      }

      const seenServiceIds = new Set<string>();
      for (const view of serviceViewsResult.data ?? []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const s = view.services as any;
        if (!s || s.status !== "visible") continue;
        if (favServiceIds.has(view.service_id)) continue;
        if (seenServiceIds.has(view.service_id)) continue;
        seenServiceIds.add(view.service_id);

        const variants: SearchVariant[] = (s.service_variants ?? [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((v: any) => ({
            id: v.id,
            name: v.name,
            priceMin: v.price_min,
            priceMax: v.price_max,
          }));

        const allPrices = [
          s.base_price_min,
          s.base_price_max,
          ...variants.flatMap((v) => [v.priceMin, v.priceMax]),
        ].filter((pr): pr is number => pr != null);

        items.push({
          type: "service",
          listingId: view.service_id,
          name: s.name,
          description: s.description ?? null,
          categoryName: s.service_categories?.name ?? "",
          workerName: s.users?.name ?? "",
          minPrice: allPrices.length > 0 ? Math.min(...allPrices) : null,
          maxPrice: allPrices.length > 0 ? Math.max(...allPrices) : null,
          viewedAt: view.viewed_at,
          variants,
        });
      }

      items.sort(
        (a, b) =>
          new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime(),
      );

      return { right: items };
    } catch (error) {
      return {
        left: { message: (error as Error).message, code: "UNKNOWN_ERROR" },
      };
    }
  }
}
