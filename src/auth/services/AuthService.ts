
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
    // First, create account in Supabase Auth
    const { data: account, error: errorAccount } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
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

    const userId = account.user?.id ?? "";
    const now = new Date().toISOString();

    // Then, create mirror record in public.users
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        id: userId,
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

    if (userError) {
      await supabase.auth.admin.deleteUser(userId);
      return {
        left: {
          message: userError.message,
          code: userError.code ?? "UNKNOWN_ERROR",
        },
      };
    }

    // Create empty user_preferences record (UC-AUTH-01 step 9)
    await supabase.from("user_preferences").insert({
      user_id: userId,
      created_at: now,
      updated_at: now,
    });

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

    // Check if account is active (UC-AUTH-02 step 3b)
    const { data: userRecord } = await supabase
      .from("users")
      .select("is_active")
      .eq("id", session.user.id)
      .single();

    if (userRecord && !userRecord.is_active) {
      await supabase.auth.signOut();
      return {
        left: {
          message: "INACTIVE_ACCOUNT",
          code: "INACTIVE_ACCOUNT",
        },
      };
    }

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

  static async logout(supabase: SupabaseClient): Promise<void> {
    await supabase.auth.signOut();
  }
}
