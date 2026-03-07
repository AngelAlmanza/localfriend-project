import z from "zod/v3"

export interface ServiceSchemaMessages {
  nameMin: string
  nameMax: string
  descriptionMax: string
  categoryRequired: string
  variantNameRequired: string
  variantNameMax: string
  priceNonNegative: string
}

const optionalPrice = (msg: string) =>
  z.number().nonnegative(msg).nullable().optional()

export const buildServiceVariantSchema = (msgs: ServiceSchemaMessages) =>
  z.object({
    id: z.string().optional(),
    name: z.string().min(1, msgs.variantNameRequired).max(100, msgs.variantNameMax),
    priceMin: optionalPrice(msgs.priceNonNegative),
    priceMax: optionalPrice(msgs.priceNonNegative),
  })

export const buildServiceSchema = (msgs: ServiceSchemaMessages) =>
  z.object({
    name: z.string().min(3, msgs.nameMin).max(255, msgs.nameMax),
    description: z
      .string()
      .max(1000, msgs.descriptionMax)
      .optional()
      .or(z.literal("")),
    serviceCategoryId: z.string().min(1, msgs.categoryRequired),
    basePriceMin: optionalPrice(msgs.priceNonNegative),
    basePriceMax: optionalPrice(msgs.priceNonNegative),
    variants: z.array(buildServiceVariantSchema(msgs)),
    deletedVariantIds: z.array(z.string()),
  })

export type ServiceSchema = z.infer<ReturnType<typeof buildServiceSchema>>
export type ServiceVariantSchema = z.infer<ReturnType<typeof buildServiceVariantSchema>>
