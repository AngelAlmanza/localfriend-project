export type SearchListingType = "product" | "service"
export type SearchContentType = "products" | "services" | "both"

export interface SearchResultItem {
  id: string
  type: SearchListingType
  name: string
  description: string | null
  categoryName: string
  categoryId: string
  workerName: string
  workerId: string
  minPrice: number | null
  maxPrice: number | null
  isFavorited: boolean
  createdAt: string
  // Product-specific
  isImmediate?: boolean
  // Service-specific
  basePriceMin?: number | null
  basePriceMax?: number | null
  variants: SearchVariant[]
}

export interface SearchVariant {
  id: string
  name: string
  price?: number | null
  priceMin?: number | null
  priceMax?: number | null
}

export interface SearchFilters {
  contentType: SearchContentType
  productCategories: string[]
  serviceCategories: string[]
  priceMin: number | null
  priceMax: number | null
  search: string
}

export interface SearchResultDetail extends SearchResultItem {
  workerEmail: string | null
  workerLatitude: number | null
  workerLongitude: number | null
}

export interface CategoryOption {
  id: string
  name: string
  type: SearchListingType
}

export interface FavoriteItem {
  id: string
  type: SearchListingType
  listingId: string
  name: string
  description: string | null
  categoryName: string
  workerName: string
  minPrice: number | null
  maxPrice: number | null
  createdAt: string
  variants: SearchVariant[]
}

export interface RecentlyViewedItem {
  type: SearchListingType
  listingId: string
  name: string
  description: string | null
  categoryName: string
  workerName: string
  minPrice: number | null
  maxPrice: number | null
  viewedAt: string
  variants: SearchVariant[]
}
