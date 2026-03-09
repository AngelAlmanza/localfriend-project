import { ISystemError } from "@/src/shared/interfaces/ISystemError";
import { Either } from "@/src/shared/types/either";
import { SupabaseClient } from "@supabase/supabase-js";

export class RegisterViewService {
  static async registerView(
    type: "product" | "service",
    listingId: string,
    userId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, boolean>> {
    try {
      const table = type === "product" ? "product_views" : "service_views";
      const fkColumn = type === "product" ? "product_id" : "service_id";

      const { error } = await supabase.from(table).insert({
        [fkColumn]: listingId,
        user_id: userId,
        viewed_at: new Date().toISOString(),
      });

      if (error) {
        return {
          left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" },
        };
      }

      return { right: true };
    } catch (error) {
      return {
        left: { message: (error as Error).message, code: "UNKNOWN_ERROR" },
      };
    }
  }
}