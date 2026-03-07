import { buildServiceSchema } from "@/src/workers-listings/schemas/service.schema"
import { describe, expect, it } from "vitest"

const msgs = {
  nameMin: "Name min 3",
  nameMax: "Name max 255",
  descriptionMax: "Desc max 1000",
  categoryRequired: "Category required",
  variantNameRequired: "Variant name required",
  variantNameMax: "Variant name max 100",
  priceNonNegative: "Price non-negative",
}

const schema = buildServiceSchema(msgs)

const validData = {
  name: "Plomería general",
  description: "Servicio completo",
  serviceCategoryId: "cat-1",
  basePriceMin: 50,
  basePriceMax: 200,
  variants: [],
  deletedVariantIds: [],
}

describe("buildServiceSchema", () => {
  it("accepts valid data", () => {
    const result = schema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("rejects name shorter than 3 chars", () => {
    const result = schema.safeParse({ ...validData, name: "ab" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(msgs.nameMin)
    }
  })

  it("rejects empty category", () => {
    const result = schema.safeParse({ ...validData, serviceCategoryId: "" })
    expect(result.success).toBe(false)
  })

  it("accepts null price values", () => {
    const result = schema.safeParse({ ...validData, basePriceMin: null, basePriceMax: null })
    expect(result.success).toBe(true)
  })

  it("accepts empty variants (optional for services)", () => {
    const result = schema.safeParse({ ...validData, variants: [] })
    expect(result.success).toBe(true)
  })

  it("rejects negative price", () => {
    const result = schema.safeParse({ ...validData, basePriceMin: -10 })
    expect(result.success).toBe(false)
  })

  it("accepts variants with price ranges", () => {
    const result = schema.safeParse({
      ...validData,
      variants: [
        { name: "Básico", priceMin: 50, priceMax: 100 },
        { name: "Premium", priceMin: 100, priceMax: 250 },
      ],
    })
    expect(result.success).toBe(true)
  })

  it("rejects variant with empty name", () => {
    const result = schema.safeParse({
      ...validData,
      variants: [{ name: "", priceMin: 50, priceMax: 100 }],
    })
    expect(result.success).toBe(false)
  })

  it("accepts variant with null prices", () => {
    const result = schema.safeParse({
      ...validData,
      variants: [{ name: "Básico", priceMin: null, priceMax: null }],
    })
    expect(result.success).toBe(true)
  })

  it("accepts optional description as empty string", () => {
    const result = schema.safeParse({ ...validData, description: "" })
    expect(result.success).toBe(true)
  })
})
