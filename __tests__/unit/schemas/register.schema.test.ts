import { buildRegisterSchema } from "@/src/auth/schemas/register.schema"
import { describe, expect, it } from "vitest"

const messages = {
  nameErrorMessage: "Name is required",
  roleErrorMessage: "Role is required",
  emailErrorMessage: "Invalid email",
  passwordErrorMessage: "Password must be at least 8 characters",
  confirmPasswordErrorMessage: "Passwords do not match",
}

const schema = buildRegisterSchema(messages)

describe("buildRegisterSchema", () => {
  const validData = {
    name: "John Doe",
    role: "local" as const,
    email: "john@example.com",
    password: "securepass",
    confirmPassword: "securepass",
  }

  it("validates correct registration data", () => {
    const result = schema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("accepts worker role", () => {
    const result = schema.safeParse({ ...validData, role: "worker" })
    expect(result.success).toBe(true)
  })

  it("fails with empty name", () => {
    const result = schema.safeParse({ ...validData, name: "" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(messages.nameErrorMessage)
  })

  it("fails with invalid role", () => {
    const result = schema.safeParse({ ...validData, role: "admin" })
    expect(result.success).toBe(false)
  })

  it("fails with invalid email", () => {
    const result = schema.safeParse({ ...validData, email: "not-an-email" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(messages.emailErrorMessage)
  })

  it("fails with short password", () => {
    const result = schema.safeParse({ ...validData, password: "123", confirmPassword: "123" })
    expect(result.success).toBe(false)
  })

  it("fails when passwords do not match", () => {
    const result = schema.safeParse({ ...validData, confirmPassword: "differentpass" })
    expect(result.success).toBe(false)
    const issue = result.error?.issues.find((i) => i.path.includes("confirmPassword"))
    expect(issue?.message).toBe(messages.confirmPasswordErrorMessage)
  })
})
