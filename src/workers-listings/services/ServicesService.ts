import { EntityStatus } from "@/src/shared/constants/EntityStatus";
import { IPaginatedResponse } from "@/src/shared/interfaces/IPaginatedResponse";
import { ISystemError } from "@/src/shared/interfaces/ISystemError";
import { Either } from "@/src/shared/types/either";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  CreateServiceDTO,
  UpdateServiceDTO,
  UpdateServiceStatusDTO,
} from "../interfaces/dtos";
import {
  ServiceResponse,
  ServiceVariantResponse,
} from "../interfaces/responses";

const DEFAULT_PAGE_SIZE = 10;
const SERVICE_SELECT = `*, service_categories(id, name), service_variants(id, name, price_min, price_max, created_at, updated_at)`;

export class ServicesService {
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

  static async getWorkerServices(
    workerId: string,
    supabase: SupabaseClient,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  ): Promise<Either<ISystemError, IPaginatedResponse<ServiceResponse>>> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("services")
        .select(SERVICE_SELECT, { count: "exact" })
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
          data: (data ?? []).map(this.mapToServiceResponse),
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

  static async getServiceById(
    id: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, ServiceResponse>> {
    try {
      const { data, error } = await supabase
        .from("services")
        .select(SERVICE_SELECT)
        .eq("id", id)
        .single();

      if (error) {
        return {
          left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" },
        };
      }

      return { right: this.mapToServiceResponse(data) };
    } catch (error) {
      return {
        left: { message: (error as Error).message, code: "UNKNOWN_ERROR" },
      };
    }
  }

  static async createService(
    dto: CreateServiceDTO,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, ServiceResponse>> {
    try {
      const { data: service, error: serviceError } = await supabase
        .from("services")
        .insert({
          name: dto.name,
          description: dto.description ?? null,
          service_category_id: dto.serviceCategoryId,
          base_price_min: dto.basePriceMin ?? null,
          base_price_max: dto.basePriceMax ?? null,
          worker_id: dto.workerId,
          status: EntityStatus.VISIBLE,
        })
        .select("id")
        .single();

      if (serviceError) {
        return {
          left: {
            message: serviceError.message,
            code: serviceError.code ?? "UNKNOWN_ERROR",
          },
        };
      }

      if (dto.variants.length > 0) {
        const { error: variantsError } = await supabase
          .from("service_variants")
          .insert(
            dto.variants.map((v) => ({
              service_id: service.id,
              name: v.name,
              price_min: v.priceMin ?? null,
              price_max: v.priceMax ?? null,
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
      }

      return this.getServiceById(service.id, supabase);
    } catch (error) {
      return {
        left: { message: (error as Error).message, code: "UNKNOWN_ERROR" },
      };
    }
  }

  static async updateService(
    dto: UpdateServiceDTO,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, ServiceResponse>> {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("services")
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
        .from("services")
        .update({
          name: dto.name,
          description: dto.description ?? null,
          service_category_id: dto.serviceCategoryId,
          base_price_min: dto.basePriceMin ?? null,
          base_price_max: dto.basePriceMax ?? null,
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
          .from("service_variants")
          .delete()
          .in("id", dto.deletedVariantIds);
      }

      const existingVariants = dto.variants.filter((v) => v.id);
      const newVariants = dto.variants.filter((v) => !v.id);

      for (const v of existingVariants) {
        await supabase
          .from("service_variants")
          .update({
            name: v.name,
            price_min: v.priceMin ?? null,
            price_max: v.priceMax ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", v.id!);
      }

      if (newVariants.length > 0) {
        await supabase.from("service_variants").insert(
          newVariants.map((v) => ({
            service_id: dto.id,
            name: v.name,
            price_min: v.priceMin ?? null,
            price_max: v.priceMax ?? null,
          })),
        );
      }

      return this.getServiceById(dto.id, supabase);
    } catch (error) {
      return {
        left: { message: (error as Error).message, code: "UNKNOWN_ERROR" },
      };
    }
  }

  static async updateServiceStatus(
    dto: UpdateServiceStatusDTO,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, boolean>> {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("services")
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
        .from("services")
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

  static async deleteService(
    id: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, boolean>> {
    try {
      const { error } = await supabase.from("services").delete().eq("id", id);

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
  private static mapToServiceResponse(data: any): ServiceResponse {
    return {
      id: data.id,
      name: data.name,
      description: data.description ?? null,
      basePriceMin: data.base_price_min ?? null,
      basePriceMax: data.base_price_max ?? null,
      status: data.status,
      workerId: data.worker_id,
      serviceCategoryId: data.service_category_id,
      categoryName: data.service_categories?.name ?? "",
      variants: (data.service_variants ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (v: any): ServiceVariantResponse => ({
          id: v.id,
          name: v.name,
          priceMin: v.price_min ?? null,
          priceMax: v.price_max ?? null,
          serviceId: data.id,
          createdAt: v.created_at,
          updatedAt: v.updated_at,
        }),
      ),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
