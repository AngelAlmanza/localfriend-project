"use client"

import { Package, UserCircle, Wrench } from "lucide-react"
import { useTranslations } from "next-intl"
import type { Report } from "../interfaces/Report"
import { ReportStatusBadge } from "./ReportStatusBadge"

interface ReportKanbanCardProps {
  report: Report
}

const statusBorder: Record<string, string> = {
  pending: "border-l-amber-400",
  in_review: "border-l-blue-400",
  closed: "border-l-gray-300",
}

export const ReportKanbanCard = ({ report }: ReportKanbanCardProps) => {
  const t = useTranslations("Reports.admin.card")

  const targetLabel = report.productId
    ? `${t("product")}: ${report.productName}`
    : report.serviceId
      ? `${t("service")}: ${report.serviceName}`
      : report.reportedUserId
        ? `${t("user")}: ${report.reportedUserName}`
        : "—"

  const TargetIcon = report.productId
    ? Package
    : report.serviceId
      ? Wrench
      : UserCircle

  return (
    <div
      className={[
        "w-full rounded-lg border border-gray-200 bg-white p-3 shadow-sm",
        "border-l-[3px] transition-all duration-150",
        "hover:shadow-md hover:border-gray-300",
        statusBorder[report.status] ?? "border-l-gray-300",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <ReportStatusBadge status={report.status} result={report.result} />
        <span className="text-[10px] text-gray-400 tabular-nums shrink-0">
          {new Date(report.createdAt).toLocaleDateString("es", {
            day: "2-digit",
            month: "short",
          })}
        </span>
      </div>

      {/* Target entity */}
      <div className="flex items-center gap-1.5 mb-2">
        <TargetIcon className="size-3 text-gray-400 shrink-0" />
        <span className="text-xs text-gray-600 font-medium truncate">{targetLabel}</span>
      </div>

      {/* Reason preview */}
      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{report.reason}</p>

      {/* Footer */}
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
          {t("reportedBy")}: {report.reporterName}
        </span>
        {report.evidences.length > 0 && (
          <span className="text-[10px] text-blue-500 shrink-0">
            {report.evidences.length} ev.
          </span>
        )}
      </div>
    </div>
  )
}
