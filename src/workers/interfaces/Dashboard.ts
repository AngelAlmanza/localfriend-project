export interface ViewsDataPoint {
  label: string
  products: number
  services: number
}

export type ViewsPeriod = "daily" | "weekly" | "monthly"

export interface TopListing {
  id: string
  name: string
  views: number
}

export interface TopContactListing {
  id: string
  name: string
  type: "product" | "service"
  clicks: number
}

export interface ChannelDistribution {
  channel: string
  count: number
}

export interface DashboardReview {
  id: string
  listingName: string
  listingType: "product" | "service"
  authorName: string
  rating: number
  comment: string | null
  createdAt: string
}

export interface DashboardData {
  views: {
    daily: ViewsDataPoint[]
    weekly: ViewsDataPoint[]
    monthly: ViewsDataPoint[]
  }
  topProducts: TopListing[]
  topServices: TopListing[]
  topContactListings: TopContactListing[]
  channelDistribution: ChannelDistribution[]
  recentReviews: DashboardReview[]
  totalViews: number
  totalContacts: number
}
