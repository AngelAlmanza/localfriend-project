import type { EntityStatus } from "@/src/shared/types/entityStatus";

export interface ProductVariantResponse {
  id: string;
  name: string;
  price: number;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string | null;
  isImmediate: boolean;
  status: EntityStatus;
  workerId: string;
  productCategoryId: string;
  categoryName: string;
  variants: ProductVariantResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceVariantResponse {
  id: string;
  name: string;
  priceMin: number | null;
  priceMax: number | null;
  serviceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceResponse {
  id: string;
  name: string;
  description: string | null;
  basePriceMin: number | null;
  basePriceMax: number | null;
  status: EntityStatus;
  workerId: string;
  serviceCategoryId: string;
  categoryName: string;
  variants: ServiceVariantResponse[];
  createdAt: string;
  updatedAt: string;
}
