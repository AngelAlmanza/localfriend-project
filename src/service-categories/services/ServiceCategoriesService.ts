import { ISystemError } from "@/src/shared/interfaces/ISystemError";
import { Either } from "@/src/shared/types/either";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  CreateServiceCategoryDTO,
  UpdateServiceCategoryDTO,
} from "../interfaces/dtos";
import { ServiceCategoryResponse } from "../interfaces/responses";

export class ServiceCategoriesService {
  static async getServiceCategories(
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, ServiceCategoryResponse[]>> {
    try {
      const { data: serviceCategories, error: errorServiceCategories } =
        await supabase.from("service_categories").select("*");

      if (errorServiceCategories) {
        return {
          left: {
            message: errorServiceCategories.message,
            code: errorServiceCategories.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      return {
        right: serviceCategories.map(this.mapToServiceCategoryResponse),
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

  static async createServiceCategory(
    data: CreateServiceCategoryDTO,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, ServiceCategoryResponse>> {
    try {
      const { data: serviceCategory, error: errorServiceCategory } =
        await supabase
          .from("service_categories")
          .insert({
            name: data.name,
            description: data.description,
            image_url: data.imageUrl,
          })
          .select("*")
          .single();

      if (errorServiceCategory) {
        return {
          left: {
            message: errorServiceCategory.message,
            code: errorServiceCategory.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      return {
        right: this.mapToServiceCategoryResponse(serviceCategory),
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

  static async deleteServiceCategory(
    id: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, boolean>> {
    try {
      const { error } = await supabase
        .from("service_categories")
        .delete()
        .eq("id", id);

      if (error) {
        return {
          left: {
            message: error.message,
            code: error.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      return { right: true };
    } catch (error) {
      return {
        left: {
          message: (error as Error).message,
          code: "UNKNOWN_ERROR",
        },
      };
    }
  }

  static async updateServiceCategory(
    data: UpdateServiceCategoryDTO,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, ServiceCategoryResponse>> {
    try {
      const { data: serviceCategory, error: errorServiceCategory } =
        await supabase
          .from("service_categories")
          .update({
            name: data.name,
            description: data.description,
            image_url: data.imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.id)
          .select("*")
          .single();

      if (errorServiceCategory) {
        return {
          left: {
            message: errorServiceCategory.message,
            code: errorServiceCategory.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      return {
        right: this.mapToServiceCategoryResponse(serviceCategory),
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

  private static mapToServiceCategoryResponse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
  ): ServiceCategoryResponse {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      imageUrl: data.image_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
