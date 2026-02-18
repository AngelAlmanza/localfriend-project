
import { ISystemError } from "@/src/shared/interfaces/ISystemError";
import { Either } from "@/src/shared/types/either";
import { SystemRole } from "@/src/shared/types/systemRoles";
import { SupabaseClient } from "@supabase/supabase-js";
import { LoginDTO, RegisterDTO } from "../interfaces/dtos";
import { LoginResponse, RegisterResponse } from "../interfaces/responses";

export class AuthService {
  static async register(
    data: RegisterDTO,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, RegisterResponse>> {
    // First, create account
    const { data: account, error: errorAccount } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        // TODO: Add email redirect to
        // emailRedirectTo: `${Environment.APP_URL}/auth/callback`,
        data: {
          name: data.name,
          role: data.role,
        },
      }
    });

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

  static async login(
    data: LoginDTO,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, LoginResponse>> {
    const { data: session, error: errorSession } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (errorSession) {
      return {
        left: {
          message: errorSession.message,
          code: errorSession.code ?? "UNKNOWN_ERROR",
        },
      };
    }

    // Role comes from the metadata of the user
    return {
      right: {
        session: {
          session: session.session,
          user: session.user,
          role: session.user?.user_metadata.role as SystemRole,
        }
      },
    };
  }
}
