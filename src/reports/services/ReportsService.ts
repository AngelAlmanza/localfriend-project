import { StorageService } from "@/src/shared/services/StorageService"
import { ISystemError } from "@/src/shared/interfaces/ISystemError"
import { Either } from "@/src/shared/types/either"
import { SupabaseClient } from "@supabase/supabase-js"
import type { CloseReportInput, CreateReportInput, Report } from "../interfaces/Report"

const EVIDENCE_BUCKET = "report-evidences"

export class ReportsService {
  /**
   * Creates a report and optionally uploads evidence files to Supabase Storage
   * using StorageService. Files that fail to upload are skipped (non-blocking).
   * Returns the full report record on success.
   */
  static async createReport(
    input: CreateReportInput,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, Report>> {
    try {
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .insert({
          reporter_id: input.reporterId,
          product_id: input.productId ?? null,
          service_id: input.serviceId ?? null,
          reported_user_id: input.reportedUserId ?? null,
          reason: input.reason,
          status: "pending",
          result: null,
        })
        .select("id, created_at")
        .single()

      if (reportError) {
        return {
          left: { message: reportError.message, code: reportError.code ?? "UNKNOWN_ERROR" },
        }
      }

      const reportId: string = reportData.id

      // Upload evidence files via StorageService
      if (input.evidenceFiles && input.evidenceFiles.length > 0) {
        const uploadResults = await Promise.allSettled(
          input.evidenceFiles.map((file) => {
            const ext = file.name.split(".").pop() ?? "bin"
            const path = `${reportId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
            return StorageService.uploadFile(file, EVIDENCE_BUCKET, path, supabase)
          }),
        )

        const successfulUrls = uploadResults
          .filter((r): r is PromiseFulfilledResult<Either<ISystemError, string>> =>
            r.status === "fulfilled" && !!r.value.right,
          )
          .map((r) => (r as PromiseFulfilledResult<Either<ISystemError, string>>).value.right!)

        if (successfulUrls.length > 0) {
          await supabase.from("report_evidences").insert(
            successfulUrls.map((url) => ({ report_id: reportId, file_url: url })),
          )
        }
      }

      return await ReportsService.getReportById(reportId, supabase)
    } catch (error) {
      return { left: { message: (error as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  /**
   * Fetches a single report by ID with full relational data.
   */
  static async getReportById(
    reportId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, Report>> {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          id, created_at, updated_at, reason, status, result,
          reporter_id,
          reporter:users!reports_reporter_id_fkey(name, email),
          reported_user:users!reports_reported_user_id_fkey(id, name),
          products(id, name),
          services(id, name),
          report_evidences(id, file_url)
        `)
        .eq("id", reportId)
        .single()

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: ReportsService.mapRow(data) }
    } catch (error) {
      return { left: { message: (error as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  /**
   * Fetches all reports (admin only — filtered server-side by RLS).
   */
  static async getAllReports(
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, Report[]>> {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          id, created_at, updated_at, reason, status, result,
          reporter_id,
          reporter:users!reports_reporter_id_fkey(name, email),
          reported_user:users!reports_reported_user_id_fkey(id, name),
          products(id, name),
          services(id, name),
          report_evidences(id, file_url)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return { right: (data ?? []).map(ReportsService.mapRow) }
    } catch (error) {
      return { left: { message: (error as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  /**
   * Moves a report to "in_review" status.
   */
  static async moveToInReview(
    reportId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, Report>> {
    return ReportsService.updateStatus(reportId, "in_review", supabase)
  }

  /**
   * Closes a report with a result and optional moderation actions.
   */
  static async closeReport(
    input: CloseReportInput,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, Report>> {
    try {
      // Apply moderation actions in parallel
      const moderationTasks: Promise<unknown>[] = []

      if (input.deactivateUser) {
        const reportResult = await supabase
          .from("reports")
          .select("reported_user_id")
          .eq("id", input.reportId)
          .single()

        if (reportResult.data?.reported_user_id) {
          moderationTasks.push(
            (async () => {
              const res = await supabase
                .from("users")
                .update({ is_active: false })
                .eq("id", reportResult.data.reported_user_id)
              if (res.error) throw new Error(res.error.message)
              return res.data
            })()
          )
        }
      }

      if (input.hideListingId && input.hideListingType) {
        const table = input.hideListingType === "product" ? "products" : "services"
        moderationTasks.push(
          (async () => {
            const res = await supabase
              .from(table)
              .update({ status: "hidden_hard" })
              .eq("id", input.hideListingId)
            if (res.error) throw new Error(res.error.message)
            return res.data
          })()
        )
      }

      await Promise.all(moderationTasks)

      // Close the report
      const { error } = await supabase
        .from("reports")
        .update({
          status: "closed",
          result: input.result,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.reportId)

      if (error) {
        return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
      }

      return ReportsService.getReportById(input.reportId, supabase)
    } catch (error) {
      return { left: { message: (error as Error).message, code: "UNKNOWN_ERROR" } }
    }
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  /**
   * Moves a report back to "pending" status.
   */
  static async moveToPending(
    reportId: string,
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, Report>> {
    return ReportsService.updateStatus(reportId, "pending", supabase)
  }

  private static async updateStatus(
    reportId: string,
    status: "pending" | "in_review" | "closed",
    supabase: SupabaseClient,
  ): Promise<Either<ISystemError, Report>> {
    const { error } = await supabase
      .from("reports")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", reportId)

    if (error) {
      return { left: { message: error.message, code: error.code ?? "UNKNOWN_ERROR" } }
    }

    return ReportsService.getReportById(reportId, supabase)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapRow(row: any): Report {
    const reporter = Array.isArray(row.reporter) ? row.reporter[0] : row.reporter
    const reportedUser = Array.isArray(row.reported_user)
      ? row.reported_user[0]
      : row.reported_user
    const product = Array.isArray(row.products) ? row.products[0] : row.products
    const service = Array.isArray(row.services) ? row.services[0] : row.services

    return {
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      reporterId: row.reporter_id,
      reporterName: reporter?.name ?? "Usuario",
      reporterEmail: reporter?.email ?? "",
      reportedUserId: reportedUser?.id ?? null,
      reportedUserName: reportedUser?.name ?? null,
      productId: product?.id ?? null,
      productName: product?.name ?? null,
      serviceId: service?.id ?? null,
      serviceName: service?.name ?? null,
      reason: row.reason,
      status: row.status,
      result: row.result ?? null,
      evidences: (row.report_evidences ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e: any) => ({ id: e.id, fileUrl: e.file_url }),
      ),
    }
  }
}
