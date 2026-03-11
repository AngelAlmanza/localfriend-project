import { ConsoleEmailService } from "@/src/shared/lib/smtp/ConsoleEmailService"
import { describe, expect, it, vi } from "vitest"

describe("ConsoleEmailService", () => {
  it("calls console.log for new report notification", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})
    const service = new ConsoleEmailService()

    await service.sendNewReportNotification({
      adminEmails: ["admin@localfriend.com"],
      reportId: "rep-001",
      reporterName: "Ana López",
      reason: "Producto con información falsa",
      targetDescription: "Producto: Pan artesanal",
      createdAt: "2026-03-10T10:00:00Z",
    })

    expect(consoleSpy).toHaveBeenCalled()
    const allCalls = consoleSpy.mock.calls.flat().join(" ")
    expect(allCalls).toContain("rep-001")
    expect(allCalls).toContain("Ana López")

    consoleSpy.mockRestore()
  })

  it("calls console.log for resolution notification", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})
    const service = new ConsoleEmailService()

    await service.sendReportResolutionNotification({
      reporterEmail: "ana@test.com",
      reporterName: "Ana López",
      reportId: "rep-001",
      result: "approved",
      closedAt: "2026-03-11T08:00:00Z",
    })

    expect(consoleSpy).toHaveBeenCalled()
    const allCalls = consoleSpy.mock.calls.flat().join(" ")
    expect(allCalls).toContain("rep-001")
    expect(allCalls).toContain("Aprobado")

    consoleSpy.mockRestore()
  })

  it("implements IEmailService contract", () => {
    const service = new ConsoleEmailService()
    expect(typeof service.sendNewReportNotification).toBe("function")
    expect(typeof service.sendReportResolutionNotification).toBe("function")
  })
})
