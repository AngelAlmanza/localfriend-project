import { ServiceCategoriesService } from "@/src/service-categories/services/ServiceCategoriesService"
import { describe, expect, it, vi } from "vitest"

const mockCategory = {
  id: "cat-1",
  name: "Plumbing",
  description: "Plumbing services",
  image_url: "https://example.com/img.jpg",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
}

describe("ServiceCategoriesService", () => {
  describe("getServiceCategories", () => {
    it("returns categories on success", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: [mockCategory], error: null }),
        }),
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await ServiceCategoriesService.getServiceCategories(supabase as any)
      expect(result.right).toHaveLength(1)
      expect(result.right?.[0].name).toBe("Plumbing")
      expect(result.right?.[0].imageUrl).toBe(mockCategory.image_url)
    })

    it("returns error when supabase fails", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: null, error: { message: "DB error", code: "500" } }),
        }),
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await ServiceCategoriesService.getServiceCategories(supabase as any)
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
      const result = await ServiceCategoriesService.getServiceCategories(supabase as any)
      const cat = result.right?.[0]
      expect(cat?.id).toBe(mockCategory.id)
      expect(cat?.createdAt).toBe(mockCategory.created_at)
      expect(cat?.updatedAt).toBe(mockCategory.updated_at)
    })
  })

  describe("deleteServiceCategory", () => {
    it("returns true on successful delete", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await ServiceCategoriesService.deleteServiceCategory("cat-1", supabase as any)
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
      const result = await ServiceCategoriesService.deleteServiceCategory("cat-1", supabase as any)
      expect(result.left?.message).toBe("Delete failed")
    })
  })

  describe("createServiceCategory", () => {
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
      const result = await ServiceCategoriesService.createServiceCategory(
        { name: "Plumbing", description: "Plumbing services", imageUrl: "https://example.com/img.jpg" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      )
      expect(result.right?.name).toBe("Plumbing")
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
      const result = await ServiceCategoriesService.createServiceCategory(
        { name: "Plumbing", description: "desc", imageUrl: "" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      )
      expect(result.left?.message).toBe("Insert failed")
    })
  })

  describe("updateServiceCategory", () => {
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
      const result = await ServiceCategoriesService.updateServiceCategory(
        { id: "cat-1", name: "Updated", description: "Updated desc", imageUrl: "" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      )
      expect(result.right?.id).toBe("cat-1")
    })

    it("returns error when update fails", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: { message: "Update failed", code: "500" } }),
              }),
            }),
          }),
        }),
      }
      const result = await ServiceCategoriesService.updateServiceCategory(
        { id: "cat-1", name: "Updated", description: "Updated desc", imageUrl: "" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      )
      expect(result.left?.message).toBe("Update failed")
    })
  })
})
