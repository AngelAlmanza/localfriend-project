import { ReportsService } from "@/src/reports/services/ReportsService"
import { ConsoleEmailService } from "@/src/shared/lib/smtp/ConsoleEmailService"
import { createClient } from "@/src/shared/lib/supabase/server"
import { EmailService } from "@/src/shared/services/EmailService"
import { NextRequest, NextResponse } from "next/server"

const emailService = new ConsoleEmailService()

/**
 * POST /api/reports/notify
 * Body: { type: "new_report" | "resolution", reportId: string }
 *
 * This route is called internally (server-to-server) after a report is created
 * or closed. It fetches the relevant data and delegates to IEmailService.
 *
 * Swap ConsoleEmailService for a real provider (Resend, Nodemailer, etc.)
 * by replacing the import above — no other code needs to change.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, reportId } = body as { type: string; reportId: string }

    if (!type || !reportId) {
      return NextResponse.json({ error: "Missing type or reportId" }, { status: 400 })
    }

    const supabase = await createClient()

    if (type === "new_report") {
      const [reportResult, adminEmailsResult] = await Promise.all([
        ReportsService.getReportById(reportId, supabase),
        EmailService.getAdminEmails(supabase),
      ])

      if (reportResult.left || adminEmailsResult.left) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
      }

      const report = reportResult.right!
      const adminEmails = adminEmailsResult.right!

      if (adminEmails.length === 0) {
        return NextResponse.json({ sent: false, reason: "No active admins" })
      }

      const targetDescription =
        report.productName
          ? `Producto: "${report.productName}"`
          : report.serviceName
            ? `Servicio: "${report.serviceName}"`
            : report.reportedUserName
              ? `Usuario: "${report.reportedUserName}"`
              : "Entidad desconocida"

      await emailService.sendNewReportNotification({
        adminEmails,
        reportId: report.id,
        reporterName: report.reporterName,
        reason: report.reason,
        targetDescription,
        createdAt: report.createdAt,
      })

      return NextResponse.json({ sent: true })
    }

    if (type === "resolution") {
      const reportResult = await ReportsService.getReportById(reportId, supabase)

      if (reportResult.left || !reportResult.right) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 })
      }

      const report = reportResult.right

      if (!report.result) {
        return NextResponse.json({ error: "Report has no result yet" }, { status: 400 })
      }

      await emailService.sendReportResolutionNotification({
        reporterEmail: report.reporterEmail,
        reporterName: report.reporterName,
        reportId: report.id,
        result: report.result,
        closedAt: report.updatedAt,
      })

      return NextResponse.json({ sent: true })
    }

    return NextResponse.json({ error: "Unknown notification type" }, { status: 400 })
  } catch (error) {
    console.error("[/api/reports/notify]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
