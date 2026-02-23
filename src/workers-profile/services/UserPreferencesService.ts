import { ISystemError } from "@/src/shared/interfaces/ISystemError";
import { Either } from "@/src/shared/types/either";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  CreateUserPreferencesDTO,
  UpdateUserPreferencesDTO,
} from "../interfaces/dtos";
import { UserPreferencesResponse } from "../interfaces/responses";

export class UserPreferencesService {
  static async getUserPreferences(
    userId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, UserPreferencesResponse>> {
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        return {
          left: {
            message: error.message,
            code: error.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      return {
        right: this.mapToUserPreferencesResponse(data),
      };
    } catch (error) {
      return {
        left: {
          message: (error as Error).message,
          code: "UNKNOWN_ERROR",
        },
      };
    }
  }

  static async createUserPreferences(
    data: CreateUserPreferencesDTO,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, UserPreferencesResponse>> {
    console.log("DATA", data)
    try {
      const { data: newData, error } = await supabase
        .from("user_preferences")
        .insert({
          user_id: data.userId,
          language: data.language,
          latitude: data.latitude,
          longitude: data.longitude,
          search_radius_km: data.searchRadiusKm,
          timezone: data.timezone,
          preferred_currency: data.preferredCurrency,
          // This should be in UTC timezone
          updated_at: new Date().toUTCString(),
        })
        .select("*")
        .single();

      if (error) {
        return {
          left: {
            message: error.message,
            code: error.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      return {
        right: this.mapToUserPreferencesResponse(newData),
      };
    } catch (error) {
      return {
        left: {
          message: (error as Error).message,
          code: "UNKNOWN_ERROR",
        },
      };
    }
  }

  static async updateUserPreferences(
    data: UpdateUserPreferencesDTO,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, UserPreferencesResponse>> {
    try {
      const { data: updatedData, error } = await supabase
        .from("user_preferences")
        .update({
          user_id: data.userId,
          language: data.language,
          latitude: data.latitude,
          longitude: data.longitude,
          search_radius_km: data.searchRadiusKm,
          timezone: data.timezone,
          preferred_currency: data.preferredCurrency,
          updated_at: data.updatedAt,
        })
        .eq("id", data.id)
        .select()
        .single();

      if (error) {
        return {
          left: {
            message: error.message,
            code: error.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      return {
        right: this.mapToUserPreferencesResponse(updatedData),
      };
    } catch (error) {
      return {
        left: {
          message: (error as Error).message,
          code: "UNKNOWN_ERROR",
        },
      };
    }
  }
  private static mapToUserPreferencesResponse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
  ): UserPreferencesResponse {
    return {
      id: data.id,
      language: data.language,
      latitude: data.latitude,
      longitude: data.longitude,
      searchRadius: data.search_radius_km,
      timezone: data.timezone,
      preferredCurrency: data.preferred_currency,
      userId: data.user_id,
      updatedAt: data.updated_at,
      createdAt: data.created_at,
    };
  }
}
