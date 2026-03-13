"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Plan } from "@/src/plans/interfaces/Plan"
import type { PlanSchema } from "@/src/plans/schemas/plan.schema"
import { formatDate } from "@/src/shared/utils/dateUtils"
import { CheckCircle2, CircleDollarSign, Edit2, ExternalLink } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { PlanFormModal } from "./PlanFormModal"
import { PlanPricesPanel } from "./PlanPricesPanel"
import { PlanStatusBadge } from "./PlanStatusBadge"
import { usePlansStore } from "../store/plans"

interface PlanDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPlanUpdated: (plan: Plan) => void
}

export const PlanDetailSheet = ({
  open,
  onOpenChange,
  onPlanUpdated,
}: PlanDetailSheetProps) => {
  const t = useTranslations("Admins.plans")
  const plan = usePlansStore((state) => state.selectedPlan)
  const [editOpen, setEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  if (!plan) return null

  const handleSavePlan = async (values: PlanSchema) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? t("form.saveError"))
        return
      }
      toast.success(t("form.updateSuccess"))
      setEditOpen(false)
      onPlanUpdated(data)
    } catch {
      toast.error(t("form.saveError"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-xl" side="right">
          <SheetHeader className="border-b border-zinc-200 px-6 pb-4 pt-12 dark:border-zinc-800">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <SheetTitle className="truncate text-base font-semibold">
                    {plan.name}
                  </SheetTitle>
                  <PlanStatusBadge isActive={plan.isActive} />
                </div>
                {plan.description && (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {plan.description}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditOpen(true)}
                className="shrink-0"
              >
                <Edit2 className="size-3.5" aria-hidden="true" />
                {t("form.edit")}
              </Button>
            </div>

            {/* Stripe product link */}
            {plan.stripeProductId && (
              <Link
                href={`https://dashboard.stripe.com/products/${plan.stripeProductId}`}
                target="_blank"
                className="mt-3 flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
                <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                  Stripe ID:
                </span>
                <span className="flex-1 truncate font-mono text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  {plan.stripeProductId}
                </span>
                <ExternalLink className="size-3 shrink-0 text-zinc-400" aria-hidden="true" />
              </Link>
            )}
          </SheetHeader>

          <Tabs defaultValue="prices" className="flex flex-1 flex-col overflow-hidden">
            <TabsList className="m-4 mb-0 h-9 shrink-0">
              <TabsTrigger value="prices" className="flex items-center gap-1.5 text-xs">
                <CircleDollarSign className="size-3.5" aria-hidden="true" />
                {t("tabs.prices")}
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                {t("tabs.details")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="prices" className="flex-1 overflow-y-auto px-6 py-4">
              <PlanPricesPanel onPlanUpdated={onPlanUpdated} />
            </TabsContent>

            <TabsContent value="details" className="px-6 py-4">
              {/* Plan metadata */}
              <div className="space-y-4">
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="px-4 py-3">
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      {t("details.metadata")}metadata
                    </p>
                    <dl className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <dt className="text-zinc-500 dark:text-zinc-400">{t("details.billingInterval")}</dt>
                        <dd className="font-medium capitalize text-zinc-900 dark:text-zinc-100">
                          {plan.billingInterval === "month" ? t("form.monthly") : t("form.annual")}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-zinc-500 dark:text-zinc-400">{t("details.createdAt")}</dt>
                        <dd className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                          {formatDate(plan.createdAt)}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-zinc-500 dark:text-zinc-400">{t("details.updatedAt")}</dt>
                        <dd className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                          {formatDate(plan.updatedAt)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {t("details.features")}
                  </p>
                  {plan.features.length === 0 ? (
                    <p className="text-sm italic text-zinc-400">{t("details.noFeatures")}</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2
                            className="mt-0.5 size-4 shrink-0 text-emerald-500"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-zinc-700 dark:text-zinc-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <PlanFormModal
        open={editOpen}
        plan={plan}
        isLoading={isSaving}
        onOpenChange={setEditOpen}
        onSave={handleSavePlan}
      />
    </>
  )
}
