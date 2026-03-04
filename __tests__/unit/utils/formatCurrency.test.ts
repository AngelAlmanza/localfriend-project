import { formatCurrency } from "@/src/shared/utils/formatCurrency"
import { describe, expect, it } from "vitest"

describe("formatCurrency", () => {
  it("formats amount with default MXN currency", () => {
    const result = formatCurrency(1000)
    expect(result).toMatch(/1[,.]000/)
    expect(result).toContain("$")
  })

  it("formats amount with specified currency", () => {
    const result = formatCurrency(500, "usd")
    expect(result).toMatch(/500/)
  })

  it("formats zero", () => {
    const result = formatCurrency(0)
    expect(result).toMatch(/0/)
  })

  it("formats decimal amounts", () => {
    const result = formatCurrency(99.99)
    expect(result).toMatch(/99/)
  })

  it("formats large amounts", () => {
    const result = formatCurrency(1000000)
    expect(result).toMatch(/1[,.]000[,.]000/)
  })
})
