import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { UserStats, SubscriptionStats } from "../../interfaces/AdminDashboard"
import { Users, Wrench, ShieldCheck, Clock } from "lucide-react"
import { getTranslations } from "next-intl/server"

interface StatsCardsProps {
  userStats: UserStats
  subscriptionStats: SubscriptionStats
}

export async function StatsCards({ userStats, subscriptionStats }: StatsCardsProps) {
  const t = await getTranslations("Admins.dashboard.stats")

  const cards = [
    {
      label: t("activeWorkers"),
      value: userStats.activeWorkers,
      icon: Wrench,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
    },
    {
      label: t("activeLocals"),
      value: userStats.activeLocals,
      icon: Users,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
    {
      label: t("trialSubscriptions"),
      value: subscriptionStats.trialCount,
      icon: Clock,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
    },
    {
      label: t("activeSubscriptions"),
      value: subscriptionStats.activeCount,
      icon: ShieldCheck,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}>
                <Icon className={`size-5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
