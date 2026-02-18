
import { ISystemError } from "@/src/shared/interfaces/ISystemError";
import { Either } from "@/src/shared/types/either";
import { SupabaseClient } from "@supabase/supabase-js";
import { RegisterDTO } from "../interfaces/dtos";
import { RegisterResponse } from "../interfaces/responses";

export class AuthService {
  static async register(
    data: RegisterDTO,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, RegisterResponse>> {
    // First, create account
    const { data: account, error: errorAccount } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      // options: {
      //   emailRedirectTo: `${Environment.APP_URL}/auth/callback`,
      // }
    });

    // console.log("account", account)

    if (errorAccount) {
      return {
        left: {
          message: errorAccount.message,
          code: errorAccount.code ?? "UNKNOWN_ERROR",
        },
      };
    }

    // Then, create user
    const now = new Date().toISOString();
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        id: account.user?.id,
        name: data.name,
        role: data.role,
        updated_at: now,
        created_at: now,
        email: data.email,
        password_hash: "",
        is_active: true,
      })
      .select()
      .single();

    // console.log("user", user)

    if (error) {
      // Delete account
      await supabase.auth.admin.deleteUser(account.user?.id ?? "");
      return {
        left: {
          message: error.message,
          code: error.code ?? "UNKNOWN_ERROR",
        },
      };
    }

    return {
      right: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        session: {
          session: account.session,
          user: account.user,
        }
      },
    };
  }
}
