import { EntityStatus } from "@/src/shared/constants/EntityStatus";
import { ServicesService } from "@/src/workers-listings/services/ServicesService";
import { describe, expect, it, vi } from "vitest";

const mockService = {
  id: "svc-1",
  name: "Plomería general",
  description: "Servicio de plomería",
  base_price_min: 50,
  base_price_max: 200,
  status: EntityStatus.VISIBLE,
  worker_id: "worker-1",
  service_category_id: "cat-1",
  service_categories: { id: "cat-1", name: "Hogar" },
  service_variants: [
    {
      id: "var-1",
      name: "Básico",
      price_min: 50,
      price_max: 100,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  ],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("ServicesService", () => {
  describe("getWorkerServices", () => {
    it("returns paginated services on success", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({
                  data: [mockService],
                  error: null,
                  count: 1,
                }),
              }),
            }),
          }),
        }),
      };
      const result = await ServicesService.getWorkerServices(
        "worker-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.right).toBeDefined();
      expect(result.right?.data).toHaveLength(1);
      expect(result.right?.total).toBe(1);
    });

    it("maps response fields correctly", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({
                  data: [mockService],
                  error: null,
                  count: 1,
                }),
              }),
            }),
          }),
        }),
      };
      const result = await ServicesService.getWorkerServices(
        "worker-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      const service = result.right?.data[0];
      expect(service?.id).toBe("svc-1");
      expect(service?.basePriceMin).toBe(50);
      expect(service?.basePriceMax).toBe(200);
      expect(service?.categoryName).toBe("Hogar");
      expect(service?.variants).toHaveLength(1);
      expect(service?.variants[0].priceMin).toBe(50);
      expect(service?.variants[0].priceMax).toBe(100);
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
      const result = await ServicesService.getWorkerServices(
        "worker-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.left?.message).toBe("DB error");
    });
  });

  describe("getServiceById", () => {
    it("returns service on success", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi
                .fn()
                .mockResolvedValue({ data: mockService, error: null }),
            }),
          }),
        }),
      };
      const result = await ServicesService.getServiceById(
        "svc-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.right?.id).toBe("svc-1");
      expect(result.right?.name).toBe("Plomería general");
    });
  });

  describe("createService", () => {
    it("creates service with variants on success", async () => {
      const supabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "services") {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: "svc-new" },
                    error: null,
                  }),
                }),
              }),
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi
                    .fn()
                    .mockResolvedValue({ data: mockService, error: null }),
                }),
              }),
            };
          }
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }),
      };
      const result = await ServicesService.createService(
        {
          name: "Plomería",
          serviceCategoryId: "cat-1",
          basePriceMin: 50,
          basePriceMax: 200,
          workerId: "worker-1",
          variants: [{ name: "Básico", priceMin: 50, priceMax: 100 }],
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.right).toBeDefined();
    });
  });

  describe("updateServiceStatus", () => {
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
      const result = await ServicesService.updateServiceStatus(
        { id: "svc-1", status: EntityStatus.HIDDEN },
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
      const result = await ServicesService.updateServiceStatus(
        { id: "svc-1", status: EntityStatus.VISIBLE },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.left?.code).toBe("FORBIDDEN");
    });
  });

  describe("deleteService", () => {
    it("returns true on successful delete", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      };
      const result = await ServicesService.deleteService(
        "svc-1",
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
      const result = await ServicesService.deleteService(
        "svc-1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase as any,
      );
      expect(result.left?.message).toBe("Delete failed");
    });
  });
});
