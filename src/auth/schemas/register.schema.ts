import z from "zod/v3";

export const buildRegisterSchema = (messages: Record<string, string>) => {
  return z.object({
    name: z.string().min(1, messages.nameErrorMessage),
    role: z.enum(["local", "worker"], { required_error: messages.roleErrorMessage }),
    email: z.string().email(messages.emailErrorMessage),
    password: z.string()
      .min(8, messages.passwordErrorMessage)
      .regex(/[A-Z]/, messages.passwordUppercaseErrorMessage)
      .regex(/[0-9]/, messages.passwordNumberErrorMessage)
      .regex(/[^A-Za-z0-9]/, messages.passwordSpecialErrorMessage),
    confirmPassword: z.string().min(1, messages.confirmPasswordErrorMessage),
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: messages.termsAcceptedErrorMessage }),
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: messages.confirmPasswordErrorMessage,
    path: ["confirmPassword"],
  })
}

export type RegisterSchema = z.infer<ReturnType<typeof buildRegisterSchema>>