import { EntityStatus } from "@/src/shared/constants/EntityStatus";
import { ProductsService } from "@/src/workers-listings/services/ProductsService";
import { describe, expect, it, vi } from "vitest";

const mockProduct = {
  id: "prod-1",
  name: "Pan artesanal",
  description: "Pan hecho a mano",
  is_immediate: true,
  status: EntityStatus.VISIBLE,
  worker_id: "worker-1",
  product_category_id: "cat-1",
  product_categories: { id: "cat-1", name: "Panadería" },
  product_variants: [
    {
      id: "var-1",
      name: "500g",
      price: 5.0,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  ],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("ProductsService", () => {
  describe("getWorkerProducts", () => {
    it("returns paginated products on success", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({
                  data: [mockProduct],
                  error: null,
                  count: 1,
                }),
              }),
            }),
          }),
        }),
      };
      const result = await ProductsService.getWorkerProducts(
        "worker-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.right).toBeDefined();
      expect(result.right?.data).toHaveLength(1);
      expect(result.right?.total).toBe(1);
      expect(result.right?.page).toBe(1);
      expect(result.right?.totalPages).toBe(1);
    });

    it("maps response fields correctly", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({
                  data: [mockProduct],
                  error: null,
                  count: 1,
                }),
              }),
            }),
          }),
        }),
      };
      const result = await ProductsService.getWorkerProducts(
        "worker-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      const product = result.right?.data[0];
      expect(product?.id).toBe("prod-1");
      expect(product?.name).toBe("Pan artesanal");
      expect(product?.isImmediate).toBe(true);
      expect(product?.workerId).toBe("worker-1");
      expect(product?.categoryName).toBe("Panadería");
      expect(product?.variants).toHaveLength(1);
      expect(product?.variants[0].name).toBe("500g");
      expect(product?.variants[0].price).toBe(5.0);
    });

    it("returns error when supabase fails", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: "DB error", code: "500" },
                  count: null,
                }),
              }),
            }),
          }),
        }),
      };
      const result = await ProductsService.getWorkerProducts(
        "worker-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.left?.message).toBe("DB error");
      expect(result.left?.code).toBe("500");
    });

    it("calculates pagination correctly", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi
                  .fn()
                  .mockResolvedValue({ data: [], error: null, count: 25 }),
              }),
            }),
          }),
        }),
      };
      const result = await ProductsService.getWorkerProducts(
        "worker-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
        2,
        10,
      );
      expect(result.right?.page).toBe(2);
      expect(result.right?.pageSize).toBe(10);
      expect(result.right?.totalPages).toBe(3);
    });
  });

  describe("getProductById", () => {
    it("returns product on success", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi
                .fn()
                .mockResolvedValue({ data: mockProduct, error: null }),
            }),
          }),
        }),
      };
      const result = await ProductsService.getProductById(
        "prod-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.right?.id).toBe("prod-1");
      expect(result.right?.name).toBe("Pan artesanal");
    });

    it("returns error on not found", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Not found", code: "PGRST116" },
              }),
            }),
          }),
        }),
      };
      const result = await ProductsService.getProductById(
        "nonexistent",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.left?.message).toBe("Not found");
    });
  });

  describe("createProduct", () => {
    it("creates product with variants on success", async () => {
      const supabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "products") {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: "prod-new" },
                    error: null,
                  }),
                }),
              }),
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi
                    .fn()
                    .mockResolvedValue({ data: mockProduct, error: null }),
                }),
              }),
            };
          }
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }),
      };
      const result = await ProductsService.createProduct(
        {
          name: "Pan artesanal",
          description: "Pan hecho a mano",
          productCategoryId: "cat-1",
          isImmediate: true,
          workerId: "worker-1",
          variants: [{ name: "500g", price: 5.0 }],
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.right).toBeDefined();
    });

    it("returns error when insert fails", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Insert failed", code: "500" },
              }),
            }),
          }),
        }),
      };
      const result = await ProductsService.createProduct(
        {
          name: "Test",
          productCategoryId: "cat-1",
          isImmediate: false,
          workerId: "worker-1",
          variants: [{ name: "Default", price: 1 }],
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.left?.message).toBe("Insert failed");
    });
  });

  describe("updateProductStatus", () => {
    it("updates status from visible to hidden", async () => {
      const supabase = {
        from: vi.fn().mockImplementation(() => ({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { status: EntityStatus.VISIBLE },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        })),
      };
      const result = await ProductsService.updateProductStatus(
        { id: "prod-1", status: EntityStatus.HIDDEN },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.right).toBe(true);
    });

    it("rejects status change for hidden_hard", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { status: EntityStatus.HIDDEN_HARD },
                error: null,
              }),
            }),
          }),
        }),
      };
      const result = await ProductsService.updateProductStatus(
        { id: "prod-1", status: EntityStatus.VISIBLE },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.left?.code).toBe("FORBIDDEN");
    });
  });

  describe("deleteProduct", () => {
    it("returns true on successful delete", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      };
      const result = await ProductsService.deleteProduct(
        "prod-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.right).toBe(true);
    });

    it("returns error when delete fails", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: { message: "Delete failed", code: "403" },
            }),
          }),
        }),
      };
      const result = await ProductsService.deleteProduct(
        "prod-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.left?.message).toBe("Delete failed");
    });
  });

  describe("hasActiveSubscription", () => {
    it("returns true when subscription exists", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    maybeSingle: vi
                      .fn()
                      .mockResolvedValue({ data: { id: "sub-1" } }),
                  }),
                }),
              }),
            }),
          }),
        }),
      };
      const result = await ProductsService.hasActiveSubscription(
        "worker-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result).toBe(true);
    });

    it("returns false when no subscription", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: null }),
                  }),
                }),
              }),
            }),
          }),
        }),
      };
      const result = await ProductsService.hasActiveSubscription(
        "worker-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result).toBe(false);
    });
  });
});
