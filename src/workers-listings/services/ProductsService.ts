import { EntityStatus } from "@/src/shared/constants/EntityStatus";
import { IPaginatedResponse } from "@/src/shared/interfaces/IPaginatedResponse";
import { ISystemError } from "@/src/shared/interfaces/ISystemError";
import { Either } from "@/src/shared/types/either";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  CreateProductDTO,
  UpdateProductDTO,
  UpdateProductStatusDTO,
} from "../interfaces/dtos";
import {
  ProductResponse,
  ProductVariantResponse,
} from "../interfaces/responses";

const DEFAULT_PAGE_SIZE = 10;
const PRODUCT_SELECT = `*, product_categories(id, name), product_variants(id, name, price, created_at, updated_at)`;

export class ProductsService {
  /**
   * Checks if a worker has an active subscription.
   * NOTE: Logic is complete but NOT currently used as a gate.
   * Enable this check when the Stripe/Subscriptions module is implemented.
   */
  static async hasActiveSubscription(
    workerId: string,
    supabase: SupabaseClient,
  ): Promise<boolean> {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", workerId)
      .in("status", ["trial", "active"])
      .gte("end_date", now)
      .limit(1)
      .maybeSingle();
    return !!data;
  }

  static async getWorkerProducts(
    workerId: string,
    supabase: SupabaseClient,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  ): Promise<Either<ISystemError, IPaginatedResponse<ProductResponse>>> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("products")
        .select(PRODUCT_SELECT, { count: "exact" })
        .eq("worker_id", workerId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        return {
          left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" },
        };
      }

      const total = count ?? 0;
      return {
        right: {
          data: (data ?? []).map(this.mapToProductResponse),
          total,
          page,
          pageSize,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
      };
    } catch (error) {
      return {
        left: { message: (error as Error).message, code: "UNKNOWN_ERROR" },
      };
    }
  }

  static async getProductById(
    id: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, ProductResponse>> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("id", id)
        .single();

      if (error) {
        return {
          left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" },
        };
      }

      return { right: this.mapToProductResponse(data) };
    } catch (error) {
      return {
        left: { message: (error as Error).message, code: "UNKNOWN_ERROR" },
      };
    }
  }

  static async createProduct(
    dto: CreateProductDTO,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, ProductResponse>> {
    try {
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          name: dto.name,
          description: dto.description ?? null,
          product_category_id: dto.productCategoryId,
          is_immediate: dto.isImmediate,
          worker_id: dto.workerId,
          status: EntityStatus.VISIBLE,
        })
        .select("id")
        .single();

      if (productError) {
        return {
          left: {
            message: productError.message,
            code: productError.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      const { error: variantsError } = await supabase
        .from("product_variants")
        .insert(
          dto.variants.map((v) => ({
            product_id: product.id,
            name: v.name,
            price: v.price,
          })),
        );

      if (variantsError) {
        return {
          left: {
            message: variantsError.message,
            code: variantsError.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      return this.getProductById(product.id, supabase);
    } catch (error) {
      return {
        left: { message: (error as Error).message, code: "UNKNOWN_ERROR" },
      };
    }
  }

  static async updateProduct(
    dto: UpdateProductDTO,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, ProductResponse>> {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("products")
        .select("status")
        .eq("id", dto.id)
        .single();

      if (fetchError) {
        return {
          left: {
            message: fetchError.message,
            code: fetchError.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      if (existing.status === EntityStatus.HIDDEN_HARD) {
        return {
          left: {
            message:
              "Cannot modify a listing that has been hidden by an administrator.",
            code: "FORBIDDEN",
          },
        };
      }

      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: dto.name,
          description: dto.description ?? null,
          product_category_id: dto.productCategoryId,
          is_immediate: dto.isImmediate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", dto.id);

      if (updateError) {
        return {
          left: {
            message: updateError.message,
            code: updateError.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      if (dto.deletedVariantIds.length > 0) {
        await supabase
          .from("product_variants")
          .delete()
          .in("id", dto.deletedVariantIds);
      }

      const existingVariants = dto.variants.filter((v) => v.id);
      const newVariants = dto.variants.filter((v) => !v.id);

      for (const v of existingVariants) {
        await supabase
          .from("product_variants")
          .update({
            name: v.name,
            price: v.price,
            updated_at: new Date().toISOString(),
          })
          .eq("id", v.id!);
      }

      if (newVariants.length > 0) {
        await supabase.from("product_variants").insert(
          newVariants.map((v) => ({
            product_id: dto.id,
            name: v.name,
            price: v.price,
          })),
        );
      }

      return this.getProductById(dto.id, supabase);
    } catch (error) {
      return {
        left: { message: (error as Error).message, code: "UNKNOWN_ERROR" },
      };
    }
  }

  static async updateProductStatus(
    dto: UpdateProductStatusDTO,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, boolean>> {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("products")
        .select("status")
        .eq("id", dto.id)
        .single();

      if (fetchError) {
        return {
          left: {
            message: fetchError.message,
            code: fetchError.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      if (existing.status === EntityStatus.HIDDEN_HARD) {
        return {
          left: {
            message:
              "Cannot change the status of a listing hidden by an administrator.",
            code: "FORBIDDEN",
          },
        };
      }

      const { error } = await supabase
        .from("products")
        .update({ status: dto.status, updated_at: new Date().toISOString() })
        .eq("id", dto.id);

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

  static async deleteProduct(
    id: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, boolean>> {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapToProductResponse(data: any): ProductResponse {
    return {
      id: data.id,
      name: data.name,
      description: data.description ?? null,
      isImmediate: data.is_immediate,
      status: data.status,
      workerId: data.worker_id,
      productCategoryId: data.product_category_id,
      categoryName: data.product_categories?.name ?? "",
      variants: (data.product_variants ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (v: any): ProductVariantResponse => ({
          id: v.id,
          name: v.name,
          price: v.price,
          productId: data.id,
          createdAt: v.created_at,
          updatedAt: v.updated_at,
        }),
      ),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
