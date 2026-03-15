import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PendingReport } from "../../interfaces/AdminDashboard"
import { AlertTriangle, Package, Wrench, User } from "lucide-react"
import { getTranslations } from "next-intl/server"
import Link from "next/link"

interface PendingReportsCardProps {
  reports: PendingReport[]
}

const targetIcons = {
  product: Package,
  service: Wrench,
  user: User,
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Hoy"
  if (diffDays === 1) return "Ayer"
  if (diffDays < 7) return `${diffDays}d`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`
  return `${Math.floor(diffDays / 30)}m`
}

export async function PendingReportsCard({ reports }: PendingReportsCardProps) {
  const t = await getTranslations("Admins.dashboard.reports")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-red-500/10">
            <AlertTriangle className="size-4 text-red-600" />
          </div>
          <CardTitle className="text-base">{t("title")}</CardTitle>
        </div>
        <Link
          href="/admin/reports"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("viewAll")}
        </Link>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => {
              const TargetIcon = targetIcons[report.targetType]
              return (
                <div
                  key={report.id}
                  className="flex gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-50">
                    <TargetIcon className="size-3.5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate text-sm font-medium">
                          {report.targetName || t("unknownTarget")}
                        </span>
                        <Badge
                          variant="outline"
                          className="shrink-0 text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200"
                        >
                          {t(`targetType.${report.targetType}`)}
                        </Badge>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelativeDate(report.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                      {report.reason}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t("reportedBy", { name: report.reporterName })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
