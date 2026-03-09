import { FavoritesService } from "@/src/locals-search/services/FavoritesService";
import { EntityStatus } from "@/src/shared/constants/EntityStatus";
import { describe, expect, it, vi } from "vitest";

function createChain(resolvedValue: unknown) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.in = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.gte = vi.fn().mockReturnValue(chain);
  chain.maybeSingle = vi.fn().mockResolvedValue(resolvedValue);
  chain.insert = vi.fn().mockResolvedValue(resolvedValue);
  chain.delete = vi.fn().mockReturnValue(chain);
  // For terminal awaits on the chain itself
  chain.then = vi.fn((resolve: (v: unknown) => void) => resolve(resolvedValue));
  return chain;
}

describe("FavoritesService", () => {
  describe("toggleFavorite", () => {
    it("adds a product favorite when not already favorited", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
              }),
            }),
          }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        }),
      };

      const result = await FavoritesService.toggleFavorite(
        "product",
        "prod-1",
        "user-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.right).toBe(true); // favorited
    });

    it("removes a product favorite when already favorited", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi
                  .fn()
                  .mockResolvedValue({ data: { id: "fav-1" } }),
              }),
            }),
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      };

      const result = await FavoritesService.toggleFavorite(
        "product",
        "prod-1",
        "user-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.right).toBe(false); // unfavorited
    });

    it("uses correct table for service favorites", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
              }),
            }),
          }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        }),
      };

      await FavoritesService.toggleFavorite(
        "service",
        "svc-1",
        "user-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(supabase.from).toHaveBeenCalledWith("service_favorites");
    });

    it("returns error when insert fails", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
              }),
            }),
          }),
          insert: vi.fn().mockResolvedValue({
            error: { message: "Insert error", code: "PGRST" },
          }),
        }),
      };

      const result = await FavoritesService.toggleFavorite(
        "product",
        "prod-1",
        "user-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.left).toBeDefined();
      expect(result.left?.message).toBe("Insert error");
    });
  });

  describe("getFavorites", () => {
    it("returns combined product and service favorites", async () => {
      const mockProductFav = {
        id: "pfav-1",
        created_at: "2024-01-02T00:00:00Z",
        product_id: "prod-1",
        products: {
          id: "prod-1",
          name: "Pan",
          description: "Pan artesanal",
          status: EntityStatus.VISIBLE,
          product_categories: { name: "Panadería" },
          product_variants: [{ id: "v1", name: "500g", price: 5.0 }],
          users: { name: "Carlos" },
        },
      };
      const mockServiceFav = {
        id: "sfav-1",
        created_at: "2024-01-01T00:00:00Z",
        service_id: "svc-1",
        services: {
          id: "svc-1",
          name: "Plomería",
          description: "Servicio de plomería",
          base_price_min: 100,
          base_price_max: 500,
          status: EntityStatus.VISIBLE,
          service_categories: { name: "Hogar" },
          service_variants: [],
          users: { name: "Ana" },
        },
      };

      const supabase = {
        from: vi.fn((table: string) => {
          if (table === "product_favorites") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi
                    .fn()
                    .mockResolvedValue({ data: [mockProductFav], error: null }),
                }),
              }),
            };
          }
          if (table === "service_favorites") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi
                    .fn()
                    .mockResolvedValue({ data: [mockServiceFav], error: null }),
                }),
              }),
            };
          }
          return {};
        }),
      };

      const result = await FavoritesService.getFavorites(
        "user-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.right).toBeDefined();
      expect(result.right).toHaveLength(2);
      expect(result.right?.[0].type).toBe("product");
      expect(result.right?.[1].type).toBe("service");
    });

    it("excludes hidden_hard listings", async () => {
      const mockProductFav = {
        id: "pfav-1",
        created_at: "2024-01-02T00:00:00Z",
        product_id: "prod-1",
        products: {
          id: "prod-1",
          name: "Pan",
          description: null,
          status: EntityStatus.HIDDEN_HARD,
          product_categories: { name: "Panadería" },
          product_variants: [],
          users: { name: "Carlos" },
        },
      };

      const supabase = {
        from: vi.fn((table: string) => {
          if (table === "product_favorites") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi
                    .fn()
                    .mockResolvedValue({ data: [mockProductFav], error: null }),
                }),
              }),
            };
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          };
        }),
      };

      const result = await FavoritesService.getFavorites(
        "user-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.right).toHaveLength(0);
    });
  });

  describe("getRecentlyViewed", () => {
    it("returns recently viewed items excluding favorites", async () => {
      const mockView = {
        viewed_at: "2024-01-15T00:00:00Z",
        product_id: "prod-1",
        products: {
          id: "prod-1",
          name: "Pan",
          description: "Pan artesanal",
          status: EntityStatus.VISIBLE,
          product_categories: { name: "Panadería" },
          product_variants: [{ id: "v1", name: "500g", price: 5.0 }],
          users: { name: "Carlos" },
        },
      };

      const supabase = {
        from: vi.fn((table: string) => {
          if (table === "product_favorites") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            };
          }
          if (table === "service_favorites") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            };
          }
          if (table === "product_views") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  gte: vi.fn().mockReturnValue({
                    order: vi
                      .fn()
                      .mockResolvedValue({ data: [mockView], error: null }),
                  }),
                }),
              }),
            };
          }
          if (table === "service_views") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  gte: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({ data: [], error: null }),
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };

      const result = await FavoritesService.getRecentlyViewed(
        "user-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.right).toBeDefined();
      expect(result.right).toHaveLength(1);
      expect(result.right?.[0].listingId).toBe("prod-1");
    });

    it("deduplicates views of the same listing", async () => {
      const makeView = (viewedAt: string) => ({
        viewed_at: viewedAt,
        product_id: "prod-1",
        products: {
          id: "prod-1",
          name: "Pan",
          description: null,
          status: EntityStatus.VISIBLE,
          product_categories: { name: "Panadería" },
          product_variants: [],
          users: { name: "Carlos" },
        },
      });

      const supabase = {
        from: vi.fn((table: string) => {
          if (table === "product_favorites" || table === "service_favorites") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            };
          }
          if (table === "product_views") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  gte: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({
                      data: [
                        makeView("2024-01-15T10:00:00Z"),
                        makeView("2024-01-14T10:00:00Z"),
                      ],
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === "service_views") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  gte: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({ data: [], error: null }),
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };

      const result = await FavoritesService.getRecentlyViewed(
        "user-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.right).toHaveLength(1); // deduplicated
    });
  });
});
