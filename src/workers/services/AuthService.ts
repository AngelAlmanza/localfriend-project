import { ISystemError } from "@/src/shared/interfaces/ISystemError";
import { Either } from "@/src/shared/types/either";
import { SupabaseClient } from "@supabase/supabase-js";

export class AuthService {
  static async logout(
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, boolean>> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        left: {
          message: error.message,
          code: error.code ?? "UNKNOWN_ERROR",
        },
      };
    }

    return {
      right: true,
    };
  }
}
