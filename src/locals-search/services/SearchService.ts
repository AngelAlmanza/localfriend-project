import { IPaginatedResponse } from "@/src/shared/interfaces/IPaginatedResponse";
import { ISystemError } from "@/src/shared/interfaces/ISystemError";
import { Either } from "@/src/shared/types/either";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  SearchFilters,
  SearchResultDetail,
  SearchResultItem,
  SearchVariant,
} from "../interfaces/Local";
import { SearchProductService } from "./SearchProductService";
import { SearchServiceService } from "./SearchServiceService";

const DEFAULT_PAGE_SIZE = 15;

export class SearchService {
  static async searchListings(
    userId: string,
    supabase: SupabaseClient,
    filters: SearchFilters,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    preloadedFavorites: { productIds: Set<string>; serviceIds: Set<string> },
  ): Promise<Either<ISystemError, IPaginatedResponse<SearchResultItem>>> {
    try {
      const products: SearchResultItem[] = [];
      const services: SearchResultItem[] = [];
      let productTotal = 0;
      let serviceTotal = 0;

      // Use preloaded favorites when available to avoid extra DB queries on every search
      const favoriteProductIds: Set<string> = preloadedFavorites.productIds;
      const favoriteServiceIds: Set<string> = preloadedFavorites.serviceIds;

      // --- SUBSCRIPTION BYPASS ---
      // TODO: When subscriptions are implemented, add a filter to only show
      // listings from workers with active subscriptions:
      // .in("worker_id", activeWorkerIds)
      // For now, all visible listings are shown regardless of subscription status.

      if (
        filters.contentType === "products" ||
        filters.contentType === "both"
      ) {
        const result = await this.searchProducts(
          supabase,
          {
            categories: filters.productCategories,
            priceMin: filters.priceMin,
            priceMax: filters.priceMax,
            search: filters.search,
          },
          favoriteProductIds,
          page,
          pageSize,
        );
        if (result.left) return { left: result.left };
        products.push(...result.right!.data);
        productTotal = result.right!.total;
      }

      if (
        filters.contentType === "services" ||
        filters.contentType === "both"
      ) {
        const result = await this.searchServices(
          supabase,
          {
            categories: filters.serviceCategories,
            priceMin: filters.priceMin,
            priceMax: filters.priceMax,
            search: filters.search,
          },
          favoriteServiceIds,
          page,
          pageSize,
        );
        if (result.left) return { left: result.left };
        services.push(...result.right!.data);
        serviceTotal = result.right!.total;
      }

      const combined = [...products, ...services];
      const total = productTotal + serviceTotal;

      return {
        right: {
          data: combined,
          total,
          page,
          pageSize,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
      };
    } catch (error) {
      return {
        left: { message: (error as Error).message, code: "UNKNOWN_ERROR" },
      };
    }
  }

  private static async searchProducts(
    supabase: SupabaseClient,
    filters: {
      categories: string[];
      priceMin: number | null;
      priceMax: number | null;
      search: string;
    },
    favoriteIds: Set<string>,
    page: number,
    pageSize: number,
  ): Promise<Either<ISystemError, IPaginatedResponse<SearchResultItem>>> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("products")
        .select(
          `id, name, description, is_immediate, status, created_at,
           worker_id, product_category_id,
           product_categories(id, name),
           product_variants(id, name, price),
           users!products_worker_id_fkey(id, name)`,
          { count: "exact" },
        )
        .eq("status", "visible");

      if (filters.categories.length > 0) {
        query = query.in("product_category_id", filters.categories);
      }

      if (filters.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      query = query.order("created_at", { ascending: false }).range(from, to);

      const { data, error, count } = await query;

      if (error) {
        return {
          left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" },
        };
      }

      const items: SearchResultItem[] = (data ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((row: any) => {
          const variants: SearchVariant[] = (row.product_variants ?? [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((v: any) => ({ id: v.id, name: v.name, price: v.price }));

          const prices = variants
            .map((v) => v.price)
            .filter((p): p is number => p != null);
          const minPrice = prices.length > 0 ? Math.min(...prices) : null;
          const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

          return {
            id: row.id,
            type: "product" as const,
            name: row.name,
            description: row.description ?? null,
            categoryName: row.product_categories?.name ?? "",
            categoryId: row.product_category_id,
            workerName: row.users?.name ?? "",
            workerId: row.worker_id,
            minPrice,
            maxPrice,
            isImmediate: row.is_immediate,
            isFavorited: favoriteIds.has(row.id),
            createdAt: row.created_at,
            variants,
          };
        })
        .filter((item) => {
          // DB-side price filtering on variant aggregates is not possible
          // via PostgREST without views/RPCs. Filter in memory as fallback.
          if (
            filters.priceMin != null &&
            (item.minPrice == null || item.maxPrice! < filters.priceMin)
          )
            return false;
          if (
            filters.priceMax != null &&
            (item.minPrice == null || item.minPrice > filters.priceMax)
          )
            return false;
          return true;
        });

      const total = count ?? 0;
      return {
        right: {
          data: items,
          total,
          page,
          pageSize,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
      };
    } catch (error) {
      return {
        left: { message: (error as Error).message, code: "UNKNOWN_ERROR" },
      };
    }
  }

  private static async searchServices(
    supabase: SupabaseClient,
    filters: {
      categories: string[];
      priceMin: number | null;
      priceMax: number | null;
      search: string;
    },
    favoriteIds: Set<string>,
    page: number,
    pageSize: number,
  ): Promise<Either<ISystemError, IPaginatedResponse<SearchResultItem>>> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("services")
        .select(
          `id, name, description, base_price_min, base_price_max, status, created_at,
           worker_id, service_category_id,
           service_categories(id, name),
           service_variants(id, name, price_min, price_max),
           users!services_worker_id_fkey(id, name)`,
          { count: "exact" },
        )
        .eq("status", "visible");

      if (filters.categories.length > 0) {
        query = query.in("service_category_id", filters.categories);
      }

      if (filters.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      query = query.order("created_at", { ascending: false }).range(from, to);

      const { data, error, count } = await query;

      if (error) {
        return {
          left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" },
        };
      }

      const items: SearchResultItem[] = (data ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((row: any) => {
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

          const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;
          const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : null;

          return {
            id: row.id,
            type: "service" as const,
            name: row.name,
            description: row.description ?? null,
            categoryName: row.service_categories?.name ?? "",
            categoryId: row.service_category_id,
            workerName: row.users?.name ?? "",
            workerId: row.worker_id,
            minPrice,
            maxPrice,
            basePriceMin: row.base_price_min,
            basePriceMax: row.base_price_max,
            isFavorited: favoriteIds.has(row.id),
            createdAt: row.created_at,
            variants,
          };
        })
        .filter((item) => {
          if (
            filters.priceMin != null &&
            (item.minPrice == null || item.maxPrice! < filters.priceMin)
          )
            return false;
          if (
            filters.priceMax != null &&
            (item.minPrice == null || item.minPrice > filters.priceMax)
          )
            return false;
          return true;
        });

      const total = count ?? 0;
      return {
        right: {
          data: items,
          total,
          page,
          pageSize,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
      };
    } catch (error) {
      return {
        left: { message: (error as Error).message, code: "UNKNOWN_ERROR" },
      };
    }
  }

  static async getListingDetail(
    id: string,
    type: "product" | "service",
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, SearchResultDetail>> {
    try {
      if (type === "product") {
        return SearchProductService.getProductDetail(id, supabase);
      }
      return SearchServiceService.getServiceDetail(id, supabase);
    } catch (error) {
      return {
        left: { message: (error as Error).message, code: "UNKNOWN_ERROR" },
      };
    }
  }
}
