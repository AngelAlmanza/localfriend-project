import { createClient } from "@/src/shared/lib/supabase/server"
import { ContactsSection } from "@/src/workers/components/dashboard/ContactsSection"
import { RecentReviewsCard } from "@/src/workers/components/dashboard/RecentReviewsCard"
import { TopListingsCard } from "@/src/workers/components/dashboard/TopListingsCard"
import { ViewsChart } from "@/src/workers/components/dashboard/ViewsChart"
import { DashboardService } from "@/src/workers/services/DashboardService"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const t = await getTranslations("Workers.dashboard")

  const result = await DashboardService.getDashboardData(user.id, supabase)

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

      {/* Views Chart */}
      <ViewsChart data={data.views} totalViews={data.totalViews} />

      {/* Top Products & Services */}
      <div className="grid gap-4 md:grid-cols-2">
        <TopListingsCard type="product" listings={data.topProducts} />
        <TopListingsCard type="service" listings={data.topServices} />
      </div>

      {/* Contact Clicks */}
      <ContactsSection
        topListings={data.topContactListings}
        channels={data.channelDistribution}
        totalContacts={data.totalContacts}
      />

      {/* Recent Reviews */}
      <RecentReviewsCard reviews={data.recentReviews} />
    </div>
  )
}
