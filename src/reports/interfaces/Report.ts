export type ReportStatus = "pending" | "in_review" | "closed"
export type ReportResult = "approved" | "rejected" | "not_applicable"
export type ReportTargetType = "product" | "service" | "user"

export interface Report {
  id: string
  createdAt: string
  updatedAt: string
  reporterId: string
  reporterName: string
  reporterEmail: string
  reportedUserId: string | null
  reportedUserName: string | null
  productId: string | null
  productName: string | null
  serviceId: string | null
  serviceName: string | null
  reason: string
  status: ReportStatus
  result: ReportResult | null
  evidences: ReportEvidence[]
}

export interface ReportEvidence {
  id: string
  fileUrl: string
}

export interface CreateReportInput {
  reporterId: string
  targetType: ReportTargetType
  productId?: string
  serviceId?: string
  reportedUserId?: string
  reason: string
  evidenceFiles?: File[]
}

export interface CloseReportInput {
  reportId: string
  result: ReportResult
  deactivateUser?: boolean
  hideListingId?: string
  hideListingType?: "product" | "service"
}
