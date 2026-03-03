import z from "zod/v3";

export const buildServiceCategorySchema = (
  messages: Record<string, string>,
) => {
  return z.object({
    name: z
      .string()
      .min(1, messages.nameMinErrorMessage)
      .max(255, messages.nameMaxErrorMessage),
    description: z
      .string()
      .min(10, messages.descriptionMinErrorMessage)
      .max(255, messages.descriptionMaxErrorMessage)
      .optional()
      .or(z.literal("")),
    imageUrl: z.string().optional().or(z.literal("")),
  });
};

export type ServiceCategorySchema = z.infer<
  ReturnType<typeof buildServiceCategorySchema>
>;
