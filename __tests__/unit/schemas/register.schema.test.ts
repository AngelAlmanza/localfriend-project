import { buildRegisterSchema } from "@/src/auth/schemas/register.schema"
import { describe, expect, it } from "vitest"

const messages = {
  nameErrorMessage: "Name is required",
  roleErrorMessage: "Role is required",
  emailErrorMessage: "Invalid email",
  passwordErrorMessage: "Password must be at least 8 characters",
  passwordUppercaseErrorMessage: "Password must contain at least one uppercase letter",
  passwordNumberErrorMessage: "Password must contain at least one number",
  passwordSpecialErrorMessage: "Password must contain at least one special character",
  confirmPasswordErrorMessage: "Passwords do not match",
  termsAcceptedErrorMessage: "You must accept the terms",
}

const schema = buildRegisterSchema(messages)

describe("buildRegisterSchema", () => {
  const validData = {
    name: "John Doe",
    role: "local" as const,
    email: "john@example.com",
    password: "Secure1!",
    confirmPassword: "Secure1!",
    termsAccepted: true as const,
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
    const result = schema.safeParse({ ...validData, password: "Ab1!", confirmPassword: "Ab1!" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(messages.passwordErrorMessage)
  })

  it("fails when password has no uppercase letter", () => {
    const result = schema.safeParse({ ...validData, password: "secure1!", confirmPassword: "secure1!" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(messages.passwordUppercaseErrorMessage)
  })

  it("fails when password has no number", () => {
    const result = schema.safeParse({ ...validData, password: "SecurePass!", confirmPassword: "SecurePass!" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(messages.passwordNumberErrorMessage)
  })

  it("fails when password has no special character", () => {
    const result = schema.safeParse({ ...validData, password: "Secure123", confirmPassword: "Secure123" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(messages.passwordSpecialErrorMessage)
  })

  it("fails when passwords do not match", () => {
    const result = schema.safeParse({ ...validData, confirmPassword: "Different1!" })
    expect(result.success).toBe(false)
    const issue = result.error?.issues.find((i) => i.path.includes("confirmPassword"))
    expect(issue?.message).toBe(messages.confirmPasswordErrorMessage)
  })

  it("fails when terms are not accepted", () => {
    const result = schema.safeParse({ ...validData, termsAccepted: false })
    expect(result.success).toBe(false)
    const issue = result.error?.issues.find((i) => i.path.includes("termsAccepted"))
    expect(issue?.message).toBe(messages.termsAcceptedErrorMessage)
  })

  it("fails when termsAccepted is missing", () => {
    const { termsAccepted: _, ...dataWithoutTerms } = validData
    const result = schema.safeParse(dataWithoutTerms)
    expect(result.success).toBe(false)
  })
})
