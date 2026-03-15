"use client"

import { useTranslations } from "next-intl"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TopListing } from "../../interfaces/Dashboard"
import { Package, Wrench, TrendingUp } from "lucide-react"

interface TopListingsCardProps {
  type: "product" | "service"
  listings: TopListing[]
}

export function TopListingsCard({ type, listings }: TopListingsCardProps) {
  const t = useTranslations("Workers.dashboard.topListings")

  const Icon = type === "product" ? Package : Wrench
  const maxViews = listings[0]?.views ?? 1

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-4 text-primary" />
        </div>
        <CardTitle className="text-base">
          {type === "product" ? t("topProducts") : t("topServices")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {listings.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <div className="space-y-3">
            {listings.map((listing, index) => (
              <div key={listing.id} className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{listing.name}</p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(listing.views / maxViews) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <TrendingUp className="size-3 text-muted-foreground" />
                  <span className="text-sm font-medium tabular-nums">{listing.views}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
