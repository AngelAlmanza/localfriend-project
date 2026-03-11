import { ReportsKanbanBoard } from "@/src/reports/components/ReportsKanbanBoard"
import { ReportsService } from "@/src/reports/services/ReportsService"
import { createClient } from "@/src/shared/lib/supabase/server"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("Reports.admin.page")
  return { title: t("title") }
}

const getReports = async () => {
  const supabase = await createClient()
  const { right, left } = await ReportsService.getAllReports(supabase)
  if (left) throw new Error(left.message)
  return right
}

async function ReportsAdminPage() {
  const t = await getTranslations("Reports.admin.page")
  const reports = await getReports()

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("title")}</h1>
        <p className="text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      {/* Kanban board */}
      <ReportsKanbanBoard initialReports={reports} />
    </div>
  )
}

export default ReportsAdminPage
