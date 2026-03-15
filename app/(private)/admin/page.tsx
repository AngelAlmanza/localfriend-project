import { AdminDashboardService } from "@/src/admins/services/AdminDashboardService"
import { StatsCards } from "@/src/admins/components/dashboard/StatsCards"
import { RevenueChart } from "@/src/admins/components/dashboard/RevenueChart"
import { PendingReportsCard } from "@/src/admins/components/dashboard/PendingReportsCard"
import { getTranslations } from "next-intl/server"

export default async function AdminDashboardPage() {
  const t = await getTranslations("Admins.dashboard")

  const result = await AdminDashboardService.getDashboardData()

  if (result.left) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">{result.left.message}</p>
      </div>
    )
  }

  const data = result.right

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        userStats={data.userStats}
        subscriptionStats={data.subscriptionStats}
      />

      {/* Revenue Chart */}
      <RevenueChart data={data.revenue} totalRevenue={data.totalRevenue} />

      {/* Pending Reports */}
      <PendingReportsCard reports={data.pendingReports} />
    </div>
  )
}
