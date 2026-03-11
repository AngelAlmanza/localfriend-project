import { ReportsService } from "@/src/reports/services/ReportsService"
import { EmailService } from "@/src/shared/services/EmailService"
import { describe, expect, it, vi } from "vitest"

// ── Supabase mock helpers ─────────────────────────────────────────────────

function makeChain(resolved: unknown) {
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn().mockReturnValue(chain)
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.order = vi.fn().mockReturnValue(chain)
  chain.single = vi.fn().mockResolvedValue(resolved)
  chain.insert = vi.fn().mockResolvedValue(resolved)
  chain.update = vi.fn().mockReturnValue(chain)
  return chain
}

const mockReport = {
  id: "report-1",
  created_at: "2026-03-10T10:00:00Z",
  updated_at: "2026-03-10T10:00:00Z",
  reason: "Contenido inapropiado",
  status: "pending",
  result: null,
  reporter_id: "user-1",
  reporter: { name: "Ana", email: "ana@test.com" },
  reported_user: null,
  products: null,
  services: null,
  report_evidences: [],
}

describe("ReportsService", () => {
  describe("getReportById", () => {
    it("returns a mapped report on success", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockReport, error: null }),
            }),
          }),
        }),
      }

      const result = await ReportsService.getReportById("report-1", supabase as never)

      expect(result.right).toBeDefined()
      expect(result.right?.id).toBe("report-1")
      expect(result.right?.reporterName).toBe("Ana")
      expect(result.right?.status).toBe("pending")
      expect(result.right?.evidences).toHaveLength(0)
    })

    it("returns left on DB error", async () => {
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
      }

      const result = await ReportsService.getReportById("bad-id", supabase as never)

      expect(result.left).toBeDefined()
      expect(result.left?.code).toBe("PGRST116")
    })
  })

  describe("getAllReports", () => {
    it("returns an array of mapped reports", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [mockReport], error: null }),
          }),
        }),
      }

      const result = await ReportsService.getAllReports(supabase as never)

      expect(result.right).toHaveLength(1)
      expect(result.right?.[0].id).toBe("report-1")
    })

    it("returns left on DB error", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "DB error", code: "500" },
            }),
          }),
        }),
      }

      const result = await ReportsService.getAllReports(supabase as never)

      expect(result.left).toBeDefined()
    })
  })

  describe("moveToInReview", () => {
    it("updates status to in_review and returns updated report", async () => {
      const updatedReport = { ...mockReport, status: "in_review" }
      const updateChain = {
        eq: vi.fn().mockResolvedValue({ error: null }),
      }

      const supabase = {
        from: vi.fn().mockImplementation(() => ({
          update: vi.fn().mockReturnValue(updateChain),
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedReport, error: null }),
            }),
          }),
        })),
      }

      const result = await ReportsService.moveToInReview("report-1", supabase as never)

      expect(result.right?.status).toBe("in_review")
    })
  })

  describe("EmailService.getAdminEmails", () => {
    it("returns array of admin emails", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ email: "admin@test.com" }],
                error: null,
              }),
            }),
          }),
        }),
      }

      const result = await EmailService.getAdminEmails(supabase as never)

      expect(result.right).toEqual(["admin@test.com"])
    })

    it("returns empty array when no admins", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      }

      const result = await EmailService.getAdminEmails(supabase as never)

      expect(result.right).toEqual([])
    })
  })

  describe("createReport", () => {
    it("inserts a report and returns it on success", async () => {
      const insertReturn = { id: "report-new", created_at: "2026-03-10T11:00:00Z" }
      const newReport = { ...mockReport, id: "report-new" }

      let callCount = 0
      const supabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "reports" && callCount === 0) {
            callCount++
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: insertReturn, error: null }),
                }),
              }),
            }
          }
          // Second call is the getReportById select
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: newReport, error: null }),
              }),
            }),
          }
        }),
      }

      const result = await ReportsService.createReport(
        {
          reporterId: "user-1",
          targetType: "product",
          productId: "prod-1",
          reason: "Producto falso con descripción engañosa",
        },
        supabase as never,
      )

      expect(result.right).toBeDefined()
      expect(result.right?.id).toBe("report-new")
    })

    it("returns left when insert fails", async () => {
      const supabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Insert failed", code: "23505" },
              }),
            }),
          }),
        }),
      }

      const result = await ReportsService.createReport(
        {
          reporterId: "user-1",
          targetType: "service",
          serviceId: "svc-1",
          reason: "Descripción falsa del servicio",
        },
        supabase as never,
      )

      expect(result.left).toBeDefined()
      expect(result.left?.code).toBe("23505")
    })
  })
})
