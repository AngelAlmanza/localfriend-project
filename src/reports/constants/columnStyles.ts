import { ReportStatus } from "../interfaces/Report"

export const columnAccent: Record<ReportStatus, string> = {
  pending: "border-t-amber-400",
  in_review: "border-t-blue-400",
  closed: "border-t-gray-300",
} as const;

export const columnHeaderBg: Record<ReportStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  in_review: "bg-blue-50 text-blue-700",
  closed: "bg-gray-50 text-gray-500",
} as const;