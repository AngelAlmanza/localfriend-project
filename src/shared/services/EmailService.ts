import { SupabaseClient } from "@supabase/supabase-js"
import { ISystemError } from "../interfaces/ISystemError"
import { Either } from "../types/either"

export class EmailService {
  /**
   * Gets all active admin emails (to notify on new report).
   */
  static async getAdminEmails(
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, string[]>> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("email")
        .eq("role", "admin")
        .eq("is_active", true)

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: (data ?? []).map((u) => u.email) }
    } catch (error) {
      return { left: { message: (error as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }
}