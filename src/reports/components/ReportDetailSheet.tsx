"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  FileText,
  Loader2,
  Package,
  RotateCcw,
  UserCircle,
  Wrench,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { CloseReportInput, Report } from "../interfaces/Report"
import { CloseReportDialog } from "./CloseReportDialog"
import { ReportStatusBadge } from "./ReportStatusBadge"

interface ReportDetailSheetProps {
  report: Report | null
  open: boolean
  onClose: () => void
  onMoveToReview: (reportId: string) => Promise<void>
  onMoveToPending: (reportId: string) => Promise<void>
  onClose_Report: (input: CloseReportInput) => Promise<void>
  forceCloseDialog?: boolean
  onForceCloseDialogHandled?: () => void
}

export const ReportDetailSheet = ({
  report,
  open,
  onClose,
  onMoveToReview,
  onMoveToPending,
  onClose_Report,
  forceCloseDialog,
  onForceCloseDialogHandled,
}: ReportDetailSheetProps) => {
  const t = useTranslations("Reports.admin.detail")
  const [movingToReview, setMovingToReview] = useState(false)
  const [movingToPending, setMovingToPending] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)

  useEffect(() => {
    if (forceCloseDialog) {
      setCloseDialogOpen(true)
      onForceCloseDialogHandled?.()
    }
  }, [forceCloseDialog, onForceCloseDialogHandled])

  if (!report) return null

  const handleMoveToReview = async () => {
    setMovingToReview(true)
    try {
      await onMoveToReview(report.id)
    } catch {
      toast.error(t("errorMove"))
    } finally {
      setMovingToReview(false)
    }
  }

  const handleMoveToPending = async () => {
    setMovingToPending(true)
    try {
      await onMoveToPending(report.id)
    } catch {
      toast.error(t("errorMove"))
    } finally {
      setMovingToPending(false)
    }
  }

  const handleCloseReport = async (input: CloseReportInput) => {
    try {
      await onClose_Report(input)
      setCloseDialogOpen(false)
    } catch {
      toast.error(t("errorClose"))
    }
  }

  const targetLabel = report.productId
    ? `${report.productName}`
    : report.serviceId
      ? `${report.serviceName}`
      : report.reportedUserId
        ? `${report.reportedUserName}`
        : "—"

  const targetIcon = report.productId ? (
    <Package className="size-3.5 text-gray-400 shrink-0" />
  ) : report.serviceId ? (
    <Wrench className="size-3.5 text-gray-400 shrink-0" />
  ) : (
    <UserCircle className="size-3.5 text-gray-400 shrink-0" />
  )

  const targetTypeLabel = report.productId
    ? t("reportedEntity") + " · Producto"
    : report.serviceId
      ? t("reportedEntity") + " · Servicio"
      : t("reportedEntity") + " · Usuario"

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        {/*
          SheetContent has no default padding in this project's shadcn build —
          it only has `flex flex-col gap-4`. We add:
          - sm:max-w-lg   width cap
          - overflow-hidden  let inner sections scroll independently
        */}
        <SheetContent className="sm:max-w-lg flex flex-col overflow-hidden p-0">

          {/* ── Header ─────────────────────────────────────────────── */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
            <div className="flex items-start justify-between gap-3 pr-6">
              <div className="space-y-1 min-w-0">
                <SheetTitle className="text-sm font-semibold text-gray-900 leading-tight">
                  {t("title")}
                </SheetTitle>
                <p className="text-[10px] font-mono text-gray-400 truncate">
                  {report.id}
                </p>
              </div>
              <ReportStatusBadge
                status={report.status}
                result={report.result}
                className="shrink-0 mt-0.5"
              />
            </div>
          </SheetHeader>

          {/* ── Scrollable body ─────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Reporter */}
            <section className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {t("reporter")}
              </p>
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <UserCircle className="size-4.5 text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    {report.reporterName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{report.reporterEmail}</p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Reported entity */}
            <section className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {targetTypeLabel}
              </p>
              <div className="flex items-center gap-1.5">
                {targetIcon}
                <span className="text-sm text-gray-700 font-medium">{targetLabel}</span>
              </div>
            </section>

            <Separator />

            {/* Reason */}
            <section className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {t("reason")}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                {report.reason}
              </p>
            </section>

            <Separator />

            {/* Evidences */}
            <section className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {t("evidences")}
              </p>
              {report.evidences.length === 0 ? (
                <p className="text-xs text-gray-400 italic">{t("noEvidences")}</p>
              ) : (
                <ul className="space-y-1.5">
                  {report.evidences.map((ev) => (
                    <li key={ev.id}>
                      <a
                        href={ev.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 bg-blue-50/60 hover:bg-blue-50 rounded-md px-3 py-2 border border-blue-100/80 transition-colors"
                      >
                        <FileText className="size-3.5 shrink-0" />
                        <span className="truncate flex-1">
                          {ev.fileUrl.split("/").pop()}
                        </span>
                        <ExternalLink className="size-3 shrink-0 opacity-60" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <Separator />

            {/* Metadata row */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {new Date(report.createdAt).toLocaleDateString("es", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
                {" · "}
                {new Date(report.createdAt).toLocaleTimeString("es", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {report.result && (
                <Badge variant="outline" className="text-[10px]">
                  {report.result === "approved"
                    ? "Aprobado"
                    : report.result === "rejected"
                      ? "Rechazado"
                      : "No aplica"}
                </Badge>
              )}
            </div>
          </div>

          {/* ── Sticky action footer ────────────────────────────────── */}
          <SheetFooter className="px-6 py-4 border-t border-gray-100 bg-white shrink-0 flex-col gap-2">
            {report.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 w-full"
                onClick={handleMoveToReview}
                disabled={movingToReview}
              >
                {movingToReview ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="size-3.5" />
                )}
                {t("moveToReview")}
              </Button>
            )}

            {report.status === "in_review" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 w-full"
                  onClick={handleMoveToPending}
                  disabled={movingToPending}
                >
                  {movingToPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <ArrowLeft className="size-3.5" />
                  )}
                  {t("moveToPending")}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full"
                  onClick={() => setCloseDialogOpen(true)}
                >
                  {t("closeReport")}
                </Button>
              </>
            )}

            {report.status === "closed" && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 w-full"
                onClick={handleMoveToReview}
                disabled={movingToReview}
              >
                {movingToReview ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="size-3.5" />
                )}
                {t("reopenToReview")}
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <CloseReportDialog
        open={closeDialogOpen}
        onClose={() => setCloseDialogOpen(false)}
        report={report}
        onConfirm={handleCloseReport}
      />
    </>
  )
}
