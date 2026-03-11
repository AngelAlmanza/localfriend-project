import z from "zod/v3"

export const buildReportSchema = (messages: Record<string, string>) =>
  z.object({
    reason: z
      .string()
      .min(10, { message: messages.reasonMin })
      .max(1000, { message: messages.reasonMax }),
    evidenceFiles: z
      .array(z.instanceof(typeof window !== "undefined" ? File : Object as unknown as typeof File))
      .max(5, { message: messages.evidencesMax })
      .optional(),
  })

export type ReportSchema = z.infer<ReturnType<typeof buildReportSchema>>

export const buildCloseReportSchema = (messages: Record<string, string>) =>
  z.object({
    result: z.enum(["approved", "rejected", "not_applicable"], {
      required_error: messages.resultRequired,
    }),
    deactivateUser: z.boolean().optional(),
    hideListingId: z.string().uuid().optional(),
    hideListingType: z.enum(["product", "service"]).optional(),
  })

export type CloseReportSchema = z.infer<ReturnType<typeof buildCloseReportSchema>>
