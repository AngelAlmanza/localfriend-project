"use client"

import { Kanban, KanbanBoard, KanbanColumn, KanbanItem } from "@/components/ui/kanban"
import { createClient } from "@/src/shared/lib/supabase/client"
import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { useTranslations } from "next-intl"
import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { columnAccent, columnHeaderBg } from "../constants/columnStyles"
import { REQUIRES_INPUT, VALID_TRANSITIONS } from "../constants/stateMachine"
import type { CloseReportInput, Report, ReportStatus } from "../interfaces/Report"
import { ReportsService } from "../services/ReportsService"
import { KanbanColumns } from "../types"
import { toColumns } from "../utils/toColumns"
import { ReportDetailSheet } from "./ReportDetailSheet"
import { ReportKanbanCard } from "./ReportKanbanCard"

const COLUMNS: ReportStatus[] = ["pending", "in_review", "closed"]

interface ReportsKanbanBoardProps {
  initialReports: Report[]
}

export const ReportsKanbanBoard = ({ initialReports }: ReportsKanbanBoardProps) => {
  const t = useTranslations("Reports.admin.detail")
  const tAdmin = useTranslations("Reports.admin")
  const supabase = useMemo(() => createClient(), [])

  // Sensors with activation constraint: clicks (<8px movement) never trigger drag
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const initialColumns = toColumns(initialReports)

  // Ref keeps columns in sync for synchronous reads inside event handlers,
  // since React state updates are async and won't be visible immediately.
  const columnsRef = useRef<KanbanColumns>(initialColumns)
  const [columns, setColumns] = useState<KanbanColumns>(initialColumns)

  // Snapshot taken at drag-start to enable rollback and diff detection.
  const prevColumnsRef = useRef<KanbanColumns>(initialColumns)

  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [forceCloseDialog, setForceCloseDialog] = useState(false)

  const applyColumns = (next: KanbanColumns) => {
    columnsRef.current = next
    setColumns(next)
  }

  // Helper: remove a report from all columns
  const withoutReport = (id: string) => (s: ReportStatus) =>
    columnsRef.current[s].filter((r) => r.id !== id)

  // Called by Kanban during drag-over (optimistic cross-column move).
  const handleValueChange = (newColumns: Record<string, Report[]>) => {
    applyColumns(newColumns as KanbanColumns)
  }

  // Snapshot current state so we can detect what changed and roll back on error.
  const handleDragStart = (_event: DragStartEvent) => {
    prevColumnsRef.current = { ...columnsRef.current }
  }

  // Called ONCE when drag ends. Uses state machine to validate and execute transitions.
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active } = event
    if (!active) return

    const reportId = active.id as string
    const prevStatus = COLUMNS.find((s) =>
      prevColumnsRef.current[s].some((r) => r.id === reportId),
    )
    // columnsRef.current is already up-to-date (handleValueChange was sync)
    const newStatus = COLUMNS.find((s) =>
      columnsRef.current[s].some((r) => r.id === reportId),
    )

    if (!prevStatus || !newStatus || prevStatus === newStatus) return

    // Validate against state machine
    const isValid = VALID_TRANSITIONS[prevStatus].includes(newStatus)
    if (!isValid) {
      toast.error(t("invalidMovement"))
      applyColumns(prevColumnsRef.current)
      return
    }

    // Transitions that need user input: rollback visually and open the sheet + close dialog
    const needsInput = REQUIRES_INPUT[prevStatus]?.includes(newStatus)
    if (needsInput) {
      applyColumns(prevColumnsRef.current)
      const report = prevColumnsRef.current[prevStatus].find((r) => r.id === reportId) ?? null
      setSelectedReport(report)
      setSheetOpen(true)
      setForceCloseDialog(true)
      return
    }

    // Immediate transition: call API, update or rollback
    const serviceCall =
      newStatus === "in_review"
        ? ReportsService.moveToInReview(reportId, supabase)
        : ReportsService.moveToPending(reportId, supabase)

    const { right, left } = await serviceCall
    if (left) {
      toast.error(t("errorMove"))
      applyColumns(prevColumnsRef.current)
      return
    }
    if (right) {
      const without = withoutReport(reportId)
      applyColumns({
        pending: newStatus === "pending" ? [...without("pending"), right] : without("pending"),
        in_review: newStatus === "in_review" ? [...without("in_review"), right] : without("in_review"),
        closed: without("closed"),
      })
      if (selectedReport?.id === reportId) setSelectedReport(right)
    }
  }

  const handleCardClick = (report: Report) => {
    setSelectedReport(report)
    setSheetOpen(true)
  }

  // ── Sheet action handlers ─────────────────────────────────────────────────

  const handleMoveToReview = async (reportId: string) => {
    const { right, left } = await ReportsService.moveToInReview(reportId, supabase)
    if (left) throw new Error(left.message)
    if (right) {
      const without = withoutReport(reportId)
      applyColumns({
        pending: without("pending"),
        in_review: [...without("in_review"), right],
        closed: without("closed"),
      })
      setSelectedReport(right)
    }
  }

  const handleMoveToPending = async (reportId: string) => {
    const { right, left } = await ReportsService.moveToPending(reportId, supabase)
    if (left) throw new Error(left.message)
    if (right) {
      const without = withoutReport(reportId)
      applyColumns({
        pending: [...without("pending"), right],
        in_review: without("in_review"),
        closed: without("closed"),
      })
      setSelectedReport(right)
    }
  }

  const handleCloseReport = async (input: CloseReportInput) => {
    const { right, left } = await ReportsService.closeReport(input, supabase)
    if (left) throw new Error(left.message)
    if (right) {
      const without = withoutReport(input.reportId)
      applyColumns({
        pending: without("pending"),
        in_review: without("in_review"),
        closed: [...without("closed"), right],
      })
      setSelectedReport(right)

      fetch("/api/reports/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "resolution", reportId: input.reportId }),
      }).catch(() => { })
    }
  }

  const columnLabel: Record<ReportStatus, string> = {
    pending: tAdmin("columns.pending"),
    in_review: tAdmin("columns.in_review"),
    closed: tAdmin("columns.closed"),
  }

  return (
    <>
      <Kanban
        value={columns}
        onValueChange={handleValueChange}
        getItemValue={(report) => report.id}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <KanbanBoard className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              value={status}
              className={[
                "rounded-xl border border-t-[3px] bg-gray-50/60 min-h-[480px]",
                "p-0 gap-0 flex-none",
                columnAccent[status],
              ].join(" ")}
            >
              {/* Column header */}
              <div
                className={`flex items-center justify-between px-4 py-3 rounded-t-lg ${columnHeaderBg[status]}`}
              >
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {columnLabel[status]}
                </span>
                <span className="text-xs font-medium tabular-nums opacity-70">
                  {columns[status].length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-3 space-y-2.5">
                {columns[status].length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-xs text-gray-400 italic">
                    {tAdmin("page.emptyState")}
                  </div>
                ) : (
                  columns[status].map((report) => (
                    <KanbanItem
                      key={report.id}
                      value={report.id}
                      asHandle
                      className="rounded-lg p-0 border-0 bg-transparent opacity-100"
                      onClick={() => handleCardClick(report)}
                    >
                      <ReportKanbanCard report={report} />
                    </KanbanItem>
                  ))
                )}
              </div>
            </KanbanColumn>
          ))}
        </KanbanBoard>
      </Kanban>

      <ReportDetailSheet
        report={selectedReport}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onMoveToReview={handleMoveToReview}
        onMoveToPending={handleMoveToPending}
        onClose_Report={handleCloseReport}
        forceCloseDialog={forceCloseDialog}
        onForceCloseDialogHandled={() => setForceCloseDialog(false)}
      />
    </>
  )
}
