import { SearchService } from "@/src/locals-search/services/SearchService"
import { describe, expect, it, vi } from "vitest"

const mockProductRow = {
  id: "prod-1",
  name: "Pan artesanal",
  description: "Pan hecho a mano",
  is_immediate: true,
  status: "visible",
  worker_id: "worker-1",
  product_category_id: "cat-1",
  product_categories: { id: "cat-1", name: "Panadería" },
  product_variants: [
    { id: "var-1", name: "500g", price: 5.0 },
  ],
  users: { id: "worker-1", name: "Carlos" },
  created_at: "2024-01-01T00:00:00Z",
}

const mockServiceRow = {
  id: "svc-1",
  name: "Plomería",
  description: "Servicio de plomería",
  base_price_min: 100,
  base_price_max: 500,
  status: "visible",
  worker_id: "worker-2",
  service_category_id: "cat-2",
  service_categories: { id: "cat-2", name: "Hogar" },
  service_variants: [
    { id: "svar-1", name: "Básico", price_min: 100, price_max: 200 },
  ],
  users: { id: "worker-2", name: "Ana" },
  created_at: "2024-01-02T00:00:00Z",
}

function createChain(resolvedValue: unknown) {
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn().mockReturnValue(chain)
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.in = vi.fn().mockReturnValue(chain)
  chain.ilike = vi.fn().mockReturnValue(chain)
  chain.order = vi.fn().mockReturnValue(chain)
  chain.gte = vi.fn().mockReturnValue(chain)
  chain.range = vi.fn().mockResolvedValue(resolvedValue)
  chain.maybeSingle = vi.fn().mockResolvedValue(resolvedValue)
  chain.single = vi.fn().mockResolvedValue(resolvedValue)
  // Make the chain thenable so await resolves to the value (like Supabase PostgREST builder)
  chain.then = (resolve: (v: unknown) => void) => Promise.resolve(resolvedValue).then(resolve)
  return chain
}

function buildSupabaseMock(
  tableResponses: Record<string, unknown>,
) {
  return {
    from: vi.fn((table: string) => {
      const response = tableResponses[table] ?? { data: [], error: null, count: 0 }
      return createChain(response)
    }),
  }
}

describe("SearchService", () => {
  describe("searchListings", () => {
    it("returns combined products and services when contentType is 'both'", async () => {
      const supabase = buildSupabaseMock({
        product_favorites: { data: [], error: null },
        service_favorites: { data: [], error: null },
        products: { data: [mockProductRow], error: null, count: 1 },
        services: { data: [mockServiceRow], error: null, count: 1 },
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await SearchService.searchListings("user-1", supabase as any, {
        contentType: "both",
        productCategories: [],
        serviceCategories: [],
        priceMin: null,
        priceMax: null,
        search: "",
      })

      expect(result.right).toBeDefined()
      expect(result.right?.data).toHaveLength(2)
      expect(result.right?.total).toBe(2)
    })

    it("returns only products when contentType is 'products'", async () => {
      const supabase = buildSupabaseMock({
        product_favorites: { data: [], error: null },
        products: { data: [mockProductRow], error: null, count: 1 },
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await SearchService.searchListings("user-1", supabase as any, {
        contentType: "products",
        productCategories: [],
        serviceCategories: [],
        priceMin: null,
        priceMax: null,
        search: "",
      })

      expect(result.right).toBeDefined()
      expect(result.right?.data).toHaveLength(1)
      expect(result.right?.data[0].type).toBe("product")
    })

    it("returns only services when contentType is 'services'", async () => {
      const supabase = buildSupabaseMock({
        service_favorites: { data: [], error: null },
        services: { data: [mockServiceRow], error: null, count: 1 },
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await SearchService.searchListings("user-1", supabase as any, {
        contentType: "services",
        productCategories: [],
        serviceCategories: [],
        priceMin: null,
        priceMax: null,
        search: "",
      })

      expect(result.right).toBeDefined()
      expect(result.right?.data).toHaveLength(1)
      expect(result.right?.data[0].type).toBe("service")
    })

    it("maps product fields correctly", async () => {
      const supabase = buildSupabaseMock({
        product_favorites: { data: [{ product_id: "prod-1" }], error: null },
        products: { data: [mockProductRow], error: null, count: 1 },
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await SearchService.searchListings("user-1", supabase as any, {
        contentType: "products",
        productCategories: [],
        serviceCategories: [],
        priceMin: null,
        priceMax: null,
        search: "",
      })

      const item = result.right?.data[0]
      expect(item?.id).toBe("prod-1")
      expect(item?.name).toBe("Pan artesanal")
      expect(item?.workerName).toBe("Carlos")
      expect(item?.categoryName).toBe("Panadería")
      expect(item?.minPrice).toBe(5.0)
      expect(item?.isFavorited).toBe(true)
      expect(item?.variants).toHaveLength(1)
    })

    it("maps service fields correctly", async () => {
      const supabase = buildSupabaseMock({
        service_favorites: { data: [], error: null },
        services: { data: [mockServiceRow], error: null, count: 1 },
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await SearchService.searchListings("user-1", supabase as any, {
        contentType: "services",
        productCategories: [],
        serviceCategories: [],
        priceMin: null,
        priceMax: null,
        search: "",
      })

      const item = result.right?.data[0]
      expect(item?.id).toBe("svc-1")
      expect(item?.type).toBe("service")
      expect(item?.workerName).toBe("Ana")
      expect(item?.minPrice).toBe(100)
      expect(item?.maxPrice).toBe(500)
      expect(item?.isFavorited).toBe(false)
    })

    it("returns error when products query fails", async () => {
      const supabase = {
        from: vi.fn((table: string) => {
          if (table === "product_favorites") {
            return createChain({ data: [], error: null })
          }
          return createChain({
            data: null,
            error: { message: "DB error", code: "500" },
            count: 0,
          })
        }),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await SearchService.searchListings("user-1", supabase as any, {
        contentType: "products",
        productCategories: [],
        serviceCategories: [],
        priceMin: null,
        priceMax: null,
        search: "",
      })

      expect(result.left).toBeDefined()
      expect(result.left?.message).toBe("DB error")
    })
  })

  describe("registerView", () => {
    it("registers a product view", async () => {
      const insertFn = vi.fn().mockResolvedValue({ error: null })
      const supabase = {
        from: vi.fn().mockReturnValue({
          insert: insertFn,
        }),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await SearchService.registerView("product", "prod-1", "user-1", supabase as any)
      expect(result.right).toBe(true)
      expect(supabase.from).toHaveBeenCalledWith("product_views")
    })

    it("registers a service view", async () => {
      const insertFn = vi.fn().mockResolvedValue({ error: null })
      const supabase = {
        from: vi.fn().mockReturnValue({
          insert: insertFn,
        }),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await SearchService.registerView("service", "svc-1", "user-1", supabase as any)
      expect(result.right).toBe(true)
      expect(supabase.from).toHaveBeenCalledWith("service_views")
    })

    it("returns error on insert failure", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockResolvedValue({ error: { message: "Insert failed", code: "500" } }),
        }),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await SearchService.registerView("product", "prod-1", "user-1", supabase as any)
      expect(result.left).toBeDefined()
      expect(result.left?.message).toBe("Insert failed")
    })
  })
})
