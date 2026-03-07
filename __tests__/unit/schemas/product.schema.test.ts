import { buildProductSchema } from "@/src/workers-listings/schemas/product.schema"
import { describe, expect, it } from "vitest"

const msgs = {
  nameMin: "Name min 3",
  nameMax: "Name max 255",
  descriptionMax: "Desc max 1000",
  categoryRequired: "Category required",
  variantsMin: "At least one variant",
  variantNameRequired: "Variant name required",
  variantNameMax: "Variant name max 100",
  variantPriceRequired: "Price required",
  variantPricePositive: "Price must be positive",
}

const schema = buildProductSchema(msgs)

const validData = {
  name: "Pan artesanal",
  description: "Hecho a mano",
  productCategoryId: "cat-1",
  isImmediate: false,
  variants: [{ name: "500g", price: 5 }],
  deletedVariantIds: [],
}

describe("buildProductSchema", () => {
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
    const result = schema.safeParse({ ...validData, productCategoryId: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(msgs.categoryRequired)
    }
  })

  it("rejects empty variants array", () => {
    const result = schema.safeParse({ ...validData, variants: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(msgs.variantsMin)
    }
  })

  it("rejects variant with empty name", () => {
    const result = schema.safeParse({
      ...validData,
      variants: [{ name: "", price: 5 }],
    })
    expect(result.success).toBe(false)
  })

  it("rejects variant with zero price", () => {
    const result = schema.safeParse({
      ...validData,
      variants: [{ name: "500g", price: 0 }],
    })
    expect(result.success).toBe(false)
  })

  it("rejects variant with negative price", () => {
    const result = schema.safeParse({
      ...validData,
      variants: [{ name: "500g", price: -1 }],
    })
    expect(result.success).toBe(false)
  })

  it("accepts multiple variants", () => {
    const result = schema.safeParse({
      ...validData,
      variants: [
        { name: "500g", price: 5 },
        { name: "1kg", price: 9 },
      ],
    })
    expect(result.success).toBe(true)
  })

  it("accepts optional description as empty string", () => {
    const result = schema.safeParse({ ...validData, description: "" })
    expect(result.success).toBe(true)
  })

  it("accepts variant with optional id for edits", () => {
    const result = schema.safeParse({
      ...validData,
      variants: [{ id: "var-1", name: "500g", price: 5 }],
    })
    expect(result.success).toBe(true)
  })
})
