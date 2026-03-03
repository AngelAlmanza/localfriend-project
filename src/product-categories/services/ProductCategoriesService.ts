import { ISystemError } from "@/src/shared/interfaces/ISystemError";
import { Either } from "@/src/shared/types/either";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  CreateProductCategoryDTO,
  UpdateProductCategoryDTO,
} from "../interfaces/dtos";
import { ProductCategoryResponse } from "../interfaces/responses";

export class ProductCategoriesService {
  static async getProductCategories(
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, ProductCategoryResponse[]>> {
    try {
      const { data: productCategories, error: errorProductCategories } =
        await supabase.from("product_categories").select("*");

      if (errorProductCategories) {
        return {
          left: {
            message: errorProductCategories.message,
            code: errorProductCategories.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      return {
        right: productCategories.map(this.mapToProductCategoryResponse),
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

  static async createProductCategory(
    data: CreateProductCategoryDTO,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, ProductCategoryResponse>> {
    try {
      const { data: productCategory, error: errorProductCategory } =
        await supabase
          .from("product_categories")
          .insert({
            name: data.name,
            description: data.description,
            image_url: data.imageUrl,
          })
          .select("*")
          .single();

      if (errorProductCategory) {
        console.log('Error product category', errorProductCategory)
        return {
          left: {
            message: errorProductCategory.message,
            code: errorProductCategory.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      return {
        right: this.mapToProductCategoryResponse(productCategory),
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

  static async deleteProductCategory(
    id: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, boolean>> {
    try {
      const { error } = await supabase
        .from("product_categories")
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

  static async updateProductCategory(
    data: UpdateProductCategoryDTO,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, ProductCategoryResponse>> {
    try {
      const { data: productCategory, error: errorProductCategory } =
        await supabase
          .from("product_categories")
          .update({
            name: data.name,
            description: data.description,
            image_url: data.imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.id)
          .select("*")
          .single();

      if (errorProductCategory) {
        return {
          left: {
            message: errorProductCategory.message,
            code: errorProductCategory.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      return {
        right: this.mapToProductCategoryResponse(productCategory),
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

  private static mapToProductCategoryResponse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
  ): ProductCategoryResponse {
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
