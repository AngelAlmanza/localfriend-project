import z from "zod/v3";

export const buildLoginSchema = (messages: Record<string, string>) => {
  return z.object({
    email: z.string().email(messages.emailErrorMessage),
    password: z.string().min(8, messages.passwordErrorMessage),
  })
}

export type LoginSchema = z.infer<ReturnType<typeof buildLoginSchema>>