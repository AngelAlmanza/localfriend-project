import z from "zod/v3";

export const buildRegisterSchema = (messages: Record<string, string>) => {
  return z.object({
    name: z.string().min(1, messages.nameErrorMessage),
    role: z.enum(["local", "worker"], { required_error: messages.roleErrorMessage }),
    email: z.string().email(messages.emailErrorMessage),
    password: z.string().min(8, messages.passwordErrorMessage),
    confirmPassword: z.string().min(8, messages.confirmPasswordErrorMessage),
  }).refine((data) => data.password === data.confirmPassword, {
    message: messages.confirmPasswordErrorMessage,
    path: ["confirmPassword"],
  })
}

export type RegisterSchema = z.infer<ReturnType<typeof buildRegisterSchema>>