export interface CreateProductDTO {
  name: string
  description?: string | null
  productCategoryId: string
  isImmediate: boolean
  workerId: string
  variants: Array<{ name: string; price: number }>
}

export interface UpdateProductDTO {
  id: string
  name: string
  description?: string | null
  productCategoryId: string
  isImmediate: boolean
  variants: Array<{ id?: string; name: string; price: number }>
  deletedVariantIds: string[]
}

export interface UpdateProductStatusDTO {
  id: string
  status: "visible" | "hidden"
}

export interface CreateServiceDTO {
  name: string
  description?: string | null
  serviceCategoryId: string
  basePriceMin?: number | null
  basePriceMax?: number | null
  workerId: string
  variants: Array<{ name: string; priceMin?: number | null; priceMax?: number | null }>
}

export interface UpdateServiceDTO {
  id: string
  name: string
  description?: string | null
  serviceCategoryId: string
  basePriceMin?: number | null
  basePriceMax?: number | null
  variants: Array<{ id?: string; name: string; priceMin?: number | null; priceMax?: number | null }>
  deletedVariantIds: string[]
}

export interface UpdateServiceStatusDTO {
  id: string
  status: "visible" | "hidden"
}
