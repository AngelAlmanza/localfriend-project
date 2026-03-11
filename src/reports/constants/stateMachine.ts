import { ReportStatus } from "../interfaces/Report"

// State machine: which transitions are allowed via drag
const VALID_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  pending: ["in_review"],
  in_review: ["pending", "closed"],
  closed: ["in_review"],
}

// Transitions that require user input before completing (open sheet + close dialog)
const REQUIRES_INPUT: Partial<Record<ReportStatus, ReportStatus[]>> = {
  in_review: ["closed"],
}

export { VALID_TRANSITIONS, REQUIRES_INPUT }