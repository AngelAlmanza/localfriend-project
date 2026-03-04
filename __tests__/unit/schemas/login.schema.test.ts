import { buildLoginSchema } from "@/src/auth/schemas/login.schema"
import { describe, expect, it } from "vitest"

const messages = {
  emailErrorMessage: "Invalid email",
  passwordErrorMessage: "Password must be at least 8 characters",
}

const schema = buildLoginSchema(messages)

describe("buildLoginSchema", () => {
  it("validates correct credentials", () => {
    const result = schema.safeParse({ email: "user@example.com", password: "password123" })
    expect(result.success).toBe(true)
  })

  it("fails with invalid email", () => {
    const result = schema.safeParse({ email: "not-an-email", password: "password123" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(messages.emailErrorMessage)
  })

  it("fails with short password", () => {
    const result = schema.safeParse({ email: "user@example.com", password: "short" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(messages.passwordErrorMessage)
  })

  it("fails with empty email", () => {
    const result = schema.safeParse({ email: "", password: "password123" })
    expect(result.success).toBe(false)
  })

  it("fails with empty password", () => {
    const result = schema.safeParse({ email: "user@example.com", password: "" })
    expect(result.success).toBe(false)
  })

  it("fails with missing fields", () => {
    const result = schema.safeParse({})
    expect(result.success).toBe(false)
    expect(result.error?.issues).toHaveLength(2)
  })

  it("uses custom error messages", () => {
    const customMessages = {
      emailErrorMessage: "Correo inválido",
      passwordErrorMessage: "Contraseña muy corta",
    }
    const customSchema = buildLoginSchema(customMessages)
    const result = customSchema.safeParse({ email: "bad", password: "123" })
    expect(result.success).toBe(false)
    const msgs = result.error?.issues.map((i) => i.message)
    expect(msgs).toContain("Correo inválido")
  })
})
