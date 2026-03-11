export interface NewReportEmailPayload {
  adminEmails: string[]
  reportId: string
  reporterName: string
  reason: string
  targetDescription: string
  createdAt: string
}

export interface ReportResolutionEmailPayload {
  reporterEmail: string
  reporterName: string
  reportId: string
  result: "approved" | "rejected" | "not_applicable"
  closedAt: string
}

export interface IEmailService {
  sendNewReportNotification(payload: NewReportEmailPayload): Promise<void>
  sendReportResolutionNotification(payload: ReportResolutionEmailPayload): Promise<void>
}
