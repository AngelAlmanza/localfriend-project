import z from "zod/v3";

export const buildUserPreferencesSchema = (messages: Record<string, string>) => {
  return z.object({
    language: z.enum(["en", "es"], { required_error: messages.languageErrorMessage }),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    searchRadius: z.number().min(1).max(100),
    timezone: z.string().min(1).max(100, { message: messages.timezoneErrorMessage }),
    // All currencies of LATAM
    preferredCurrency: z.enum([
      "MXN", // Mexican Peso
      "COP", // Colombian Peso
      "PEN", // Peruvian Sol
      "ARS", // Argentine Peso
      "CLP", // Chilean Peso
      "UYU", // Uruguayan Peso
      "BRL", // Brazilian Real
      "VEF", // Venezuelan Bolívar
    ], { required_error: messages.preferredCurrencyErrorMessage }),
  });
}

export type UserPreferencesSchema = z.infer<ReturnType<typeof buildUserPreferencesSchema>>
