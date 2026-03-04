import { parseNumberArray } from "@/src/shared/utils/parseNumberArray"
import { parseStringArray } from "@/src/shared/utils/parseStringArray"
import { describe, expect, it } from "vitest"

describe("parseNumberArray", () => {
  it("returns fallback when value is null", () => {
    expect(parseNumberArray(null, [0, 100])).toEqual([0, 100])
  })

  it("returns fallback when value is empty string", () => {
    expect(parseNumberArray("", [0, 100])).toEqual([0, 100])
  })

  it("parses comma-separated numbers", () => {
    expect(parseNumberArray("10,200,300", [])).toEqual([10, 200, 300])
  })

  it("returns fallback when value contains non-numbers", () => {
    expect(parseNumberArray("10,abc,300", [0, 100])).toEqual([0, 100])
  })

  it("parses single number", () => {
    expect(parseNumberArray("42", [])).toEqual([42])
  })

  it("returns fallback for NaN values", () => {
    expect(parseNumberArray("NaN,5", [1, 2])).toEqual([1, 2])
  })
})

describe("parseStringArray", () => {
  it("returns empty array when value is null", () => {
    expect(parseStringArray(null)).toEqual([])
  })

  it("returns empty array when value is empty string", () => {
    expect(parseStringArray("")).toEqual([])
  })

  it("splits comma-separated string", () => {
    expect(parseStringArray("food,health,beauty")).toEqual(["food", "health", "beauty"])
  })

  it("returns single-element array for value without comma", () => {
    expect(parseStringArray("food")).toEqual(["food"])
  })

  it("handles whitespace in values", () => {
    expect(parseStringArray("food, health")).toEqual(["food", " health"])
  })
})
