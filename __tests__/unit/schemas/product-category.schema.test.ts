import { buildProductCategorySchema } from "@/src/product-categories/schema/product-category.schema"
import { describe, expect, it } from "vitest"

const messages = {
  nameMinErrorMessage: "Name is required",
  nameMaxErrorMessage: "Name too long",
  descriptionMinErrorMessage: "Description too short",
  descriptionMaxErrorMessage: "Description too long",
}

const schema = buildProductCategorySchema(messages)

describe("buildProductCategorySchema", () => {
  it("validates correct data with all fields", () => {
    const result = schema.safeParse({
      name: "Electronics",
      description: "All kinds of electronic devices",
      imageUrl: "https://example.com/image.jpg",
    })
    expect(result.success).toBe(true)
  })

  it("validates with only required fields", () => {
    const result = schema.safeParse({ name: "Food" })
    expect(result.success).toBe(true)
  })

  it("validates with empty description (optional)", () => {
    const result = schema.safeParse({ name: "Food", description: "" })
    expect(result.success).toBe(true)
  })

  it("fails with empty name", () => {
    const result = schema.safeParse({ name: "" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(messages.nameMinErrorMessage)
  })

  it("fails with name exceeding 255 chars", () => {
    const result = schema.safeParse({ name: "a".repeat(256) })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(messages.nameMaxErrorMessage)
  })

  it("fails with description shorter than 10 chars (but not empty)", () => {
    const result = schema.safeParse({ name: "Food", description: "Short" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(messages.descriptionMinErrorMessage)
  })

  it("fails with description exceeding 255 chars", () => {
    const result = schema.safeParse({ name: "Food", description: "a".repeat(256) })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(messages.descriptionMaxErrorMessage)
  })

  it("validates with exactly 255 char name", () => {
    const result = schema.safeParse({ name: "a".repeat(255) })
    expect(result.success).toBe(true)
  })
})
