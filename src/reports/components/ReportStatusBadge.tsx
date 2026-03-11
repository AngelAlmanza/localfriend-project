import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ReportResult, ReportStatus } from "../interfaces/Report"

interface ReportStatusBadgeProps {
  status: ReportStatus
  result?: ReportResult | null
  className?: string
}

const statusStyles: Record<ReportStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  in_review: "bg-blue-50 text-blue-700 border-blue-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200",
}

const resultStyles: Record<ReportResult, string> = {
  approved: "bg-red-50 text-red-700 border-red-200",
  rejected: "bg-green-50 text-green-700 border-green-200",
  not_applicable: "bg-slate-50 text-slate-600 border-slate-200",
}

export const ReportStatusBadge = ({ status, result, className }: ReportStatusBadgeProps) => {
  if (status === "closed" && result) {
    return (
      <Badge
        variant="outline"
        className={cn("text-[10px] font-medium", resultStyles[result], className)}
      >
        {result === "approved" ? "Aprobado" : result === "rejected" ? "Rechazado" : "No aplica"}
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-medium", statusStyles[status], className)}
    >
      {status === "pending" ? "Pendiente" : status === "in_review" ? "En revisión" : "Cerrado"}
    </Badge>
  )
}
