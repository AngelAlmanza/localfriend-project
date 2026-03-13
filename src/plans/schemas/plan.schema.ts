import { z } from "zod/v3"

interface PlanSchemaMessages {
  nameRequired: string
  nameMin: string
  nameMax: string
  featureRequired: string
}

export const buildPlanSchema = (messages: PlanSchemaMessages) =>
  z.object({
    name: z
      .string({ required_error: messages.nameRequired })
      .min(2, messages.nameMin)
      .max(100, messages.nameMax),
    description: z.string().max(500).optional(),
    features: z.array(z.string().min(1, messages.featureRequired)),
    billingInterval: z.enum(["month", "year"]),
    isActive: z.boolean(),
  })

export type PlanSchema = z.infer<ReturnType<typeof buildPlanSchema>>

interface PriceSchemaMessages {
  amountRequired: string
  amountPositive: string
  currencyRequired: string
}

export const buildPriceSchema = (messages: PriceSchemaMessages) =>
  z.object({
    currency: z.string({ required_error: messages.currencyRequired }).min(3).max(3),
    amount: z
      .number({ required_error: messages.amountRequired })
      .positive(messages.amountPositive),
    label: z.string().max(100).optional(),
  })

export type PriceSchema = z.infer<ReturnType<typeof buildPriceSchema>>
