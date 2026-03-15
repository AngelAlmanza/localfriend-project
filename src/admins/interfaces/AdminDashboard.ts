export interface RevenueDataPoint {
  label: string
  revenue: number
}

export type RevenuePeriod = "monthly" | "yearly"

export interface UserStats {
  activeWorkers: number
  activeLocals: number
}

export interface SubscriptionStats {
  trialCount: number
  activeCount: number
}

export interface PendingReport {
  id: string
  reason: string
  reporterName: string
  targetName: string
  targetType: "product" | "service" | "user"
  createdAt: string
}

export interface AdminDashboardData {
  revenue: {
    monthly: RevenueDataPoint[]
    yearly: RevenueDataPoint[]
  }
  totalRevenue: number
  userStats: UserStats
  subscriptionStats: SubscriptionStats
  pendingReports: PendingReport[]
}
