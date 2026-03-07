import z from "zod/v3"

export interface ProductSchemaMessages {
  nameMin: string
  nameMax: string
  descriptionMax: string
  categoryRequired: string
  variantsMin: string
  variantNameRequired: string
  variantNameMax: string
  variantPriceRequired: string
  variantPricePositive: string
}

export const buildProductVariantSchema = (msgs: ProductSchemaMessages) =>
  z.object({
    id: z.string().optional(),
    name: z.string().min(1, msgs.variantNameRequired).max(100, msgs.variantNameMax),
    price: z.coerce
      .number({ invalid_type_error: msgs.variantPriceRequired })
      .positive(msgs.variantPricePositive),
  })

export const buildProductSchema = (msgs: ProductSchemaMessages) =>
  z.object({
    name: z.string().min(3, msgs.nameMin).max(255, msgs.nameMax),
    description: z
      .string()
      .max(1000, msgs.descriptionMax)
      .optional()
      .or(z.literal("")),
    productCategoryId: z.string().min(1, msgs.categoryRequired),
    isImmediate: z.boolean(),
    variants: z.array(buildProductVariantSchema(msgs)).min(1, msgs.variantsMin),
    deletedVariantIds: z.array(z.string()),
  })

export type ProductSchema = z.infer<ReturnType<typeof buildProductSchema>>
export type ProductVariantSchema = z.infer<ReturnType<typeof buildProductVariantSchema>>
