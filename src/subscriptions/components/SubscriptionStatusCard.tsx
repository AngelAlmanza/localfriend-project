import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import moment from "moment-timezone"
import { getTranslations } from "next-intl/server"
import type { Subscription } from "../interfaces/Subscription"
import { SubscriptionStatusBadge } from "./SubscriptionStatusBadge"

interface SubscriptionStatusCardProps {
  subscription: Subscription
}

export const SubscriptionStatusCard = async ({ subscription }: SubscriptionStatusCardProps) => {
  const t = await getTranslations("Subscriptions.statusCard")

  const now = moment()
  const endDate = moment(subscription.endDate)
  const startDate = moment(subscription.startDate)
  const totalDays = Math.ceil(endDate.diff(startDate, "days"))
  const daysRemaining = Math.max(0, Math.ceil(endDate.diff(now, "days")))
  const progress = totalDays > 0 ? Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{subscription.plan?.name ?? t("planLabel")}</CardTitle>
          <SubscriptionStatusBadge status={subscription.status} />
        </div>
        <CardDescription>
          {subscription.plan?.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription.status === "trial" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("trialProgress")}</span>
              <span className="text-muted-foreground">
                {t("daysRemaining", { days: daysRemaining })}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">{t("startDate")}</span>
            <p className="font-medium">{startDate.format("DD-MM-YYYY")}</p>
          </div>
          <div>
            <span className="text-muted-foreground">
              {subscription.status === "trial" ? t("trialEnds") : t("renewalDate")}
            </span>
            <p className="font-medium">{endDate.format("DD-MM-YYYY")}</p>
          </div>
        </div>

        {subscription.plan?.features && subscription.plan.features.length > 0 && (
          <div>
            <span className="text-sm text-muted-foreground">{t("features")}</span>
            <ul className="mt-1 space-y-1">
              {subscription.plan.features.map((feature) => (
                <li key={feature} className="text-sm flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
