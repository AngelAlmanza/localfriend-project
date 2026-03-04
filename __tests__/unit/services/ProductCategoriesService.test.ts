import { ProductCategoriesService } from "@/src/product-categories/services/ProductCategoriesService"
import { describe, expect, it, vi } from "vitest"

const mockCategory = {
  id: "cat-1",
  name: "Electronics",
  description: "Electronic devices",
  image_url: "https://example.com/img.jpg",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
}

function makeSupabaseMock(overrides: Record<string, unknown> = {}) {
  const base = {
    data: [mockCategory],
    error: null,
    ...overrides,
  }
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(base),
  }
  return {
    from: vi.fn().mockReturnValue({
      ...chain,
      select: vi.fn().mockResolvedValue(base),
      insert: vi.fn().mockReturnValue({ ...chain, single: vi.fn().mockResolvedValue({ data: mockCategory, error: null }) }),
      update: vi.fn().mockReturnValue({ ...chain, eq: vi.fn().mockReturnValue({ ...chain, single: vi.fn().mockResolvedValue({ data: mockCategory, error: null }) }) }),
      delete: vi.fn().mockReturnValue({ ...chain, eq: vi.fn().mockResolvedValue({ error: null }) }),
    }),
  }
}

describe("ProductCategoriesService", () => {
  describe("getProductCategories", () => {
    it("returns categories on success", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: [mockCategory], error: null }),
        }),
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await ProductCategoriesService.getProductCategories(supabase as any)
      expect(result.right).toHaveLength(1)
      expect(result.right?.[0].name).toBe("Electronics")
      expect(result.right?.[0].imageUrl).toBe(mockCategory.image_url)
    })

    it("returns error when supabase fails", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: null, error: { message: "DB error", code: "500" } }),
        }),
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await ProductCategoriesService.getProductCategories(supabase as any)
      expect(result.left?.message).toBe("DB error")
      expect(result.left?.code).toBe("500")
    })

    it("maps response fields correctly (snake_case to camelCase)", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: [mockCategory], error: null }),
        }),
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await ProductCategoriesService.getProductCategories(supabase as any)
      const cat = result.right?.[0]
      expect(cat?.id).toBe(mockCategory.id)
      expect(cat?.createdAt).toBe(mockCategory.created_at)
      expect(cat?.updatedAt).toBe(mockCategory.updated_at)
    })
  })

  describe("deleteProductCategory", () => {
    it("returns true on successful delete", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await ProductCategoriesService.deleteProductCategory("cat-1", supabase as any)
      expect(result.right).toBe(true)
    })

    it("returns error when delete fails", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: { message: "Delete failed", code: "403" } }),
          }),
        }),
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await ProductCategoriesService.deleteProductCategory("cat-1", supabase as any)
      expect(result.left?.message).toBe("Delete failed")
    })
  })

  describe("createProductCategory", () => {
    it("returns created category on success", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockCategory, error: null }),
            }),
          }),
        }),
      }
      const result = await ProductCategoriesService.createProductCategory(
        { name: "Electronics", description: "Electronic devices", imageUrl: "https://example.com/img.jpg" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      )
      expect(result.right?.name).toBe("Electronics")
    })

    it("returns error when insert fails", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: "Insert failed", code: "500" } }),
            }),
          }),
        }),
      }
      const result = await ProductCategoriesService.createProductCategory(
        { name: "Electronics", description: "desc", imageUrl: "" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      )
      expect(result.left?.message).toBe("Insert failed")
    })
  })

  describe("updateProductCategory", () => {
    it("returns updated category on success", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockCategory, error: null }),
              }),
            }),
          }),
        }),
      }
      const result = await ProductCategoriesService.updateProductCategory(
        { id: "cat-1", name: "Updated", description: "Updated desc", imageUrl: "" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      )
      expect(result.right?.id).toBe("cat-1")
    })
  })
})
