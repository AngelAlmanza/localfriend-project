import {
  buildCloseReportSchema,
  buildReportSchema,
} from "@/src/reports/schemas/report.schema"
import { describe, expect, it } from "vitest"

const MESSAGES = {
  reasonMin: "El motivo debe tener al menos 10 caracteres",
  reasonMax: "El motivo no puede superar los 1000 caracteres",
  evidencesMax: "Puedes adjuntar un máximo de 5 archivos",
  resultRequired: "Debes seleccionar un resultado",
}

describe("buildReportSchema", () => {
  const schema = buildReportSchema(MESSAGES)

  it("accepts a valid reason", () => {
    const result = schema.safeParse({ reason: "Este producto es completamente falso" })
    expect(result.success).toBe(true)
  })

  it("rejects a reason shorter than 10 chars", () => {
    const result = schema.safeParse({ reason: "Falso" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(MESSAGES.reasonMin)
    }
  })

  it("rejects a reason longer than 1000 chars", () => {
    const result = schema.safeParse({ reason: "a".repeat(1001) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(MESSAGES.reasonMax)
    }
  })

  it("accepts an empty evidenceFiles array", () => {
    const result = schema.safeParse({
      reason: "Contenido inapropiado en el listado",
      evidenceFiles: [],
    })
    expect(result.success).toBe(true)
  })
})

describe("buildCloseReportSchema", () => {
  const schema = buildCloseReportSchema(MESSAGES)

  it("accepts approved result", () => {
    const result = schema.safeParse({ result: "approved" })
    expect(result.success).toBe(true)
  })

  it("accepts rejected result", () => {
    const result = schema.safeParse({ result: "rejected" })
    expect(result.success).toBe(true)
  })

  it("accepts not_applicable result", () => {
    const result = schema.safeParse({ result: "not_applicable" })
    expect(result.success).toBe(true)
  })

  it("rejects an unknown result", () => {
    const result = schema.safeParse({ result: "unknown" })
    expect(result.success).toBe(false)
  })

  it("accepts deactivateUser flag", () => {
    const result = schema.safeParse({
      result: "approved",
      deactivateUser: true,
    })
    expect(result.success).toBe(true)
  })

  it("accepts hideListingId + hideListingType", () => {
    const result = schema.safeParse({
      result: "approved",
      hideListingId: "550e8400-e29b-41d4-a716-446655440000",
      hideListingType: "product",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid UUID for hideListingId", () => {
    const result = schema.safeParse({
      result: "approved",
      hideListingId: "not-a-uuid",
      hideListingType: "product",
    })
    expect(result.success).toBe(false)
  })
})
