import { cn } from "@/lib/utils"
import type { EntityStatus } from "@/src/shared/types/entityStatus"

interface StatusConfig {
  className: string
  dotClassName: string
}

const STATUS_CONFIG: Record<EntityStatus, StatusConfig> = {
  visible: {
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
    dotClassName: "bg-emerald-500",
  },
  hidden: {
    className: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
    dotClassName: "bg-amber-500",
  },
  hidden_hard: {
    className: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
    dotClassName: "bg-red-500",
  },
}

interface ListingStatusBadgeProps {
  status: EntityStatus
  label: string
}

export function ListingStatusBadge({ status, label }: ListingStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      <span
        className={cn("size-1.5 rounded-full shrink-0", config.dotClassName)}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
