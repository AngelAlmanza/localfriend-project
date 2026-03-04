import { getFileName } from "@/src/shared/utils/getFileName"
import { describe, expect, it, vi } from "vitest"

describe("getFileName", () => {
  it("returns a string with the given extension", () => {
    const result = getFileName("jpg")
    expect(result).toMatch(/\.jpg$/)
  })

  it("uses Date.now() as prefix", () => {
    const mockNow = 1700000000000
    vi.spyOn(Date, "now").mockReturnValue(mockNow)

    const result = getFileName("png")
    expect(result).toBe(`${mockNow}.png`)

    vi.restoreAllMocks()
  })

  it("works with different extensions", () => {
    expect(getFileName("webp")).toMatch(/\.webp$/)
    expect(getFileName("gif")).toMatch(/\.gif$/)
    expect(getFileName("pdf")).toMatch(/\.pdf$/)
  })

  it("returns format timestamp.ext", () => {
    const before = Date.now()
    const result = getFileName("jpg")
    const after = Date.now()
    const [timestamp] = result.split(".")
    const ts = Number(timestamp)
    expect(ts).toBeGreaterThanOrEqual(before)
    expect(ts).toBeLessThanOrEqual(after)
  })
})
