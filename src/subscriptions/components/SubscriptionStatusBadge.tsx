import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import type { SubscriptionStatus } from "../interfaces/Subscription"

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus
  className?: string
}

const statusStyles: Record<SubscriptionStatus, string> = {
  trial: "bg-blue-50 text-blue-700 border-blue-200",
  active: "bg-green-50 text-green-700 border-green-200",
  canceling: "bg-orange-50 text-orange-700 border-orange-200",
  expired: "bg-yellow-50 text-yellow-700 border-yellow-200",
  canceled: "bg-red-50 text-red-700 border-red-200",
  suspended: "bg-orange-50 text-orange-700 border-orange-200",
}

export const SubscriptionStatusBadge = async ({ status, className }: SubscriptionStatusBadgeProps) => {
  const t = await getTranslations("Subscriptions.status")

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", statusStyles[status], className)}
    >
      {t(status)}
    </Badge>
  )
}
