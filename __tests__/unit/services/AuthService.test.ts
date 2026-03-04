import { AuthService } from "@/src/auth/services/AuthService"
import { describe, expect, it, vi } from "vitest"

const mockUser = {
  id: "user-123",
  email: "test@example.com",
  user_metadata: { role: "local", name: "Test User" },
}

const mockSession = { access_token: "token-abc" }

describe("AuthService.login", () => {
  it("returns session on successful login", async () => {
    const supabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { session: mockSession, user: mockUser },
          error: null,
        }),
      },
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await AuthService.login({ email: "test@example.com", password: "password123" }, supabase as any)
    expect(result.right?.session.user?.email).toBe("test@example.com")
    expect(result.right?.session.role).toBe("local")
  })

  it("returns error when login fails", async () => {
    const supabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Invalid credentials", code: "invalid_credentials" },
        }),
      },
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await AuthService.login({ email: "test@example.com", password: "wrongpass" }, supabase as any)
    expect(result.left?.message).toBe("Invalid credentials")
    expect(result.left?.code).toBe("invalid_credentials")
  })

  it("defaults code to UNKNOWN_ERROR when error has no code", async () => {
    const supabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Unknown", code: undefined },
        }),
      },
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await AuthService.login({ email: "a@b.com", password: "password123" }, supabase as any)
    expect(result.left?.code).toBe("UNKNOWN_ERROR")
  })
})

describe("AuthService.register", () => {
  const validRegister = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    confirmPassword: "password123",
    role: "local" as const,
  }

  const makeSupabase = (signUpResult: object, insertResult: object) => ({
    auth: {
      signUp: vi.fn().mockResolvedValue(signUpResult),
      admin: { deleteUser: vi.fn().mockResolvedValue({}) },
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(insertResult),
        }),
      }),
    }),
  })

  it("returns user and session on successful registration", async () => {
    const supabase = makeSupabase(
      { data: { user: mockUser, session: mockSession }, error: null },
      { data: { id: "user-123", email: "test@example.com", name: "Test User" }, error: null },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await AuthService.register(validRegister, supabase as any)
    expect(result.right?.user.email).toBe("test@example.com")
    expect(result.right?.user.name).toBe("Test User")
  })

  it("returns error when signUp fails", async () => {
    const supabase = makeSupabase(
      { data: null, error: { message: "Email already taken", code: "user_already_exists" } },
      { data: null, error: null },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await AuthService.register(validRegister, supabase as any)
    expect(result.left?.message).toBe("Email already taken")
  })

  it("deletes account and returns error when user insert fails", async () => {
    const deleteUser = vi.fn().mockResolvedValue({})
    const supabase = {
      auth: {
        signUp: vi.fn().mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null }),
        admin: { deleteUser },
      },
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: "DB insert failed", code: "500" } }),
          }),
        }),
      }),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await AuthService.register(validRegister, supabase as any)
    expect(result.left?.message).toBe("DB insert failed")
    expect(deleteUser).toHaveBeenCalledWith(mockUser.id)
  })
})
