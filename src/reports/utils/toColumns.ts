import { Report } from "../interfaces/Report";
import { KanbanColumns } from "../types";

export const toColumns = (reports: Report[]): KanbanColumns => ({
  pending: reports.filter((r) => r.status === "pending"),
  in_review: reports.filter((r) => r.status === "in_review"),
  closed: reports.filter((r) => r.status === "closed"),
})