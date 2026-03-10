export interface Review {
  id: string
  authorName: string
  rating: number // 1–5
  comment: string | null
  createdAt: string
  isOwn?: boolean
}

export interface UserReview {
  id: string
  listingId: string
  listingName: string
  listingType: "product" | "service"
  rating: number // 1–5
  comment: string | null
  createdAt: string
}
