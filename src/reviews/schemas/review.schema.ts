import z from "zod/v3"

export const buildReviewSchema = (messages: Record<string, string>) =>
  z.object({
    rating: z.number().int().min(1, { message: messages.ratingRequired }).max(5),
    comment: z.string().max(500, { message: messages.commentMax }),
  })

export type ReviewSchema = z.infer<ReturnType<typeof buildReviewSchema>>
