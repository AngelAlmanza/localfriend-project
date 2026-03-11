import type { Report, ReportStatus } from "../interfaces/Report"

export type KanbanColumns = Record<ReportStatus, Report[]>