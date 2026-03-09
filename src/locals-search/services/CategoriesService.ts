import { ISystemError } from "@/src/shared/interfaces/ISystemError";
import { Either } from "@/src/shared/types/either";
import { SupabaseClient } from "@supabase/supabase-js";
import { CategoryOption } from "../interfaces/Local";

export class CategoriesService {
  static async getProductCategories(
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, CategoryOption[]>> {
    try {
      const { data, error } = await supabase
        .from("product_categories")
        .select("id, name")
        .order("name");

      if (error) {
        return {
          left: {
            code: error.code,
            message: error.message ?? "UNKNOWN_ERROR",
          },
        };
      }

      return {
        right: data.map((pc) => ({
          id: pc.id,
          name: pc.name,
          type: "product",
        })),
      };
    } catch (error) {
      return {
        left: { message: (error as Error).message, code: "UNKNOWN_ERROR" },
      };
    }
  }

  static async getServiceCategories(
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, CategoryOption[]>> {
    try {
      const { data, error } = await supabase
        .from("service_categories")
        .select("id, name")
        .order("name");

      if (error) {
        return {
          left: {
            code: error.code,
            message: error.message ?? "INTERNAL_ERROR",
          },
        };
      }

      return {
        right: data.map((sc) => ({
          id: sc.id,
          name: sc.name,
          type: "service",
        })),
      };
    } catch (error) {
      return {
        left: { message: (error as Error).message, code: "UNKNOWN_ERROR" },
      };
    }
  }
}
