import type {
  IEmailService,
  NewReportEmailPayload,
  ReportResolutionEmailPayload,
} from "./IEmailService"

/**
 * Console implementation of IEmailService.
 * Prints email payloads to stdout — used until a real email provider is integrated.
 */
export class ConsoleEmailService implements IEmailService {
  async sendNewReportNotification(payload: NewReportEmailPayload): Promise<void> {
    console.log("=== [EMAIL] New Report Notification ===")
    console.log(`To: ${payload.adminEmails.join(", ")}`)
    console.log(`Subject: [LocalFriend] Nuevo reporte recibido — ID ${payload.reportId}`)
    console.log(`Body:`)
    console.log(`  Reporte generado por: ${payload.reporterName}`)
    console.log(`  Entidad reportada:    ${payload.targetDescription}`)
    console.log(`  Motivo:               ${payload.reason}`)
    console.log(`  Fecha:                ${payload.createdAt}`)
    console.log(`  Panel de admin:       /admin/reports/${payload.reportId}`)
    console.log("==========================================")
  }

  async sendReportResolutionNotification(
    payload: ReportResolutionEmailPayload,
  ): Promise<void> {
    const resultLabel: Record<string, string> = {
      approved: "Aprobado — se tomó acción sobre el contenido reportado.",
      rejected: "Rechazado — el reporte no tenía fundamento suficiente.",
      not_applicable:
        "No aplica — el contenido no viola las políticas pero fue registrado.",
    }

    console.log("=== [EMAIL] Report Resolution Notification ===")
    console.log(`To: ${payload.reporterEmail}`)
    console.log(`Subject: [LocalFriend] Tu reporte ha sido revisado`)
    console.log(`Body:`)
    console.log(`  Hola ${payload.reporterName},`)
    console.log(`  Tu reporte (ID: ${payload.reportId}) fue resuelto.`)
    console.log(`  Resultado: ${resultLabel[payload.result] ?? payload.result}`)
    console.log(`  Fecha de cierre: ${payload.closedAt}`)
    console.log("================================================")
  }
}
