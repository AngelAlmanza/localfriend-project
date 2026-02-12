
/**
 * Environment variables for the project
 * @description This is a constant that contains the environment variables for the project.
 * @description All of this variables must be set in the .env file.
 */
export const Environment = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
} as const;