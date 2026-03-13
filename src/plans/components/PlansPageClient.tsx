"use client"

import { Button } from "@/components/ui/button"
import type { Plan } from "@/src/plans/interfaces/Plan"
import type { PlanSchema } from "@/src/plans/schemas/plan.schema"
import { CreditCard, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { usePlansStore } from "../store/plans"
import { PlanCard } from "./PlanCard"
import { PlanDetailSheet } from "./PlanDetailSheet"
import { PlanFormModal } from "./PlanFormModal"

interface PlansPageClientProps {
  initialPlans: Plan[]
}

export const PlansPageClient = ({ initialPlans }: PlansPageClientProps) => {
  const t = useTranslations("Admins.plans")
  const plans = usePlansStore((state) => state.plans)
  const setPlans = usePlansStore((state) => state.setPlans)
  const updatePlan = usePlansStore((state) => state.updatePlan)
  const selectedPlan = usePlansStore((state) => state.selectedPlan)
  const setSelectedPlan = usePlansStore((state) => state.setSelectedPlan)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setSheetOpen(true)
  }

  const handlePlanUpdated = (updated: Plan) => {
    updatePlan(updated)
    setSelectedPlan(updated)
  }

  const handleCreatePlan = async (values: PlanSchema) => {
    setIsCreating(true)
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? t("form.saveError"))
        return
      }
      toast.success(t("form.createSuccess"))
      setAddModalOpen(false)
      setPlans(data)
    } catch {
      toast.error(t("form.saveError"))
    } finally {
      setIsCreating(false)
    }
  }

  useEffect(() => {
    setPlans(initialPlans)
  }, [initialPlans])

  return (
    <>
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t("page.title")}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t("page.subtitle")}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setAddModalOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          {t("page.addButton")}
        </Button>
      </div>

      {/* Plans grid */}
      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-20 dark:border-zinc-700">
          <CreditCard className="mb-3 size-10 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {t("page.noPlans")}
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {t("page.noPlansDescription")}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus className="size-3.5" aria-hidden="true" />
            {t("page.addButton")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan?.id === plan.id && sheetOpen}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>
      )}

      {/* Detail sheet */}
      <PlanDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onPlanUpdated={handlePlanUpdated}
      />

      {/* Create plan modal */}
      <PlanFormModal
        open={addModalOpen}
        plan={null}
        isLoading={isCreating}
        onOpenChange={setAddModalOpen}
        onSave={handleCreatePlan}
      />
    </>
  )
}
