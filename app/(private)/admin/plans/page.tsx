import { PlansPageClient } from "@/src/plans/components/PlansPageClient"
import { PlansService } from "@/src/plans/services/PlansService"
import { createClient } from "@/src/shared/lib/supabase/server"

export default async function AdminPlansPage() {
  const supabase = await createClient()
  const result = await PlansService.getPlans(supabase)
  const plans = result.right ?? []

  return (
    <div className="flex flex-col gap-6 p-6">
      <PlansPageClient initialPlans={plans} />
    </div>
  )
}
