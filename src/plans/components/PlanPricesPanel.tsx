"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Plan, Price } from "@/src/plans/interfaces/Plan"
import type { PriceSchema } from "@/src/plans/schemas/plan.schema"
import { ChevronDown, History, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import { AddPriceModal } from "./AddPriceModal"
import { usePlansStore } from "../store/plans"

const CURRENCIES = [
  { value: "MXN", flag: "🇲🇽", name: "Peso mexicano" },
  { value: "COP", flag: "🇨🇴", name: "Peso colombiano" },
  { value: "PEN", flag: "🇵🇪", name: "Sol peruano" },
  { value: "ARS", flag: "🇦🇷", name: "Peso argentino" },
  { value: "CLP", flag: "🇨🇱", name: "Peso chileno" },
  { value: "UYU", flag: "🇺🇾", name: "Peso uruguayo" },
  { value: "BRL", flag: "🇧🇷", name: "Real brasileño" },
  { value: "VEF", flag: "🇻🇪", name: "Bolívar venezolano" },
  { value: "USD", flag: "🇺🇸", name: "Dólar" },
]

interface PlanPricesPanelProps {
  onPlanUpdated: (plan: Plan) => void
}

export const PlanPricesPanel = ({ onPlanUpdated }: PlanPricesPanelProps) => {
  const t = useTranslations("Admins.plans")
  const plan = usePlansStore((state) => state.selectedPlan)!
  const [addPriceOpen, setAddPriceOpen] = useState(false)
  const [lockedCurrency, setLockedCurrency] = useState<string | null>(null)
  const [isAddingPrice, setIsAddingPrice] = useState(false)
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)
  const [expandedHistories, setExpandedHistories] = useState<Set<string>>(new Set())

  const pricesByCurrency = CURRENCIES.reduce<Record<string, { active: Price | null; history: Price[] }>>(
    (acc, c) => {
      const all = (plan.prices ?? []).filter((p) => p.currency === c.value)
      acc[c.value] = {
        active: all.find((p) => p.isActive) ?? null,
        history: all.filter((p) => !p.isActive),
      }
      return acc
    },
    {},
  )

  const toggleHistory = (currency: string) => {
    setExpandedHistories((prev) => {
      const next = new Set(prev)
      if (next.has(currency)) next.delete(currency)
      else next.add(currency)
      return next
    })
  }

  const handleAddPrice = async (values: PriceSchema) => {
    setIsAddingPrice(true)
    try {
      const res = await fetch(`/api/plans/${plan.id}/prices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? t("price.addError"))
        return
      }
      toast.success(t("price.addSuccess"))
      setAddPriceOpen(false)
      // Mark any previously active price for this currency as inactive, then append the new one
      const newPrice: Price = data
      onPlanUpdated({
        ...plan,
        prices: [
          ...(plan.prices ?? []).map((p) =>
            p.currency === newPrice.currency && p.isActive ? { ...p, isActive: false } : p,
          ),
          newPrice,
        ],
      })
    } catch {
      toast.error(t("price.addError"))
    } finally {
      setIsAddingPrice(false)
    }
  }

  const handleDeactivate = async (price: Price) => {
    setDeactivatingId(price.id)
    try {
      const res = await fetch(`/api/plans/${plan.id}/prices/${price.id}/deactivate`, {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? t("price.deactivateError"))
        return
      }
      toast.success(t("price.deactivateSuccess"))
      onPlanUpdated({
        ...plan,
        prices: (plan.prices ?? []).map((p) =>
          p.id === price.id ? { ...p, isActive: false } : p,
        ),
      })
    } catch {
      toast.error(t("price.deactivateError"))
    } finally {
      setDeactivatingId(null)
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
      }).format(amount)
    } catch {
      return `${currency} ${amount.toFixed(2)}`
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {t("price.panelTitle")}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("price.panelSubtitle")}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setLockedCurrency(null)
            setAddPriceOpen(true)
          }}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          {t("price.add")}
        </Button>
      </div>

      {/* Currency Ledger */}
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        {CURRENCIES.map((c, i) => {
          const { active, history } = pricesByCurrency[c.value]
          const isHistoryOpen = expandedHistories.has(c.value)
          const hasHistory = history.length > 0

          return (
            <div key={c.value}>
              {/* Currency row */}
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  i !== 0 && "border-t border-zinc-100 dark:border-zinc-800/60",
                )}
              >
                {/* Currency identity */}
                <div className="w-28 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none" aria-hidden="true">
                      {c.flag}
                    </span>
                    <span className="font-mono text-sm font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">
                      {c.value}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                    {c.name}
                  </p>
                </div>

                {/* Active price */}
                <div className="flex-1">
                  {active ? (
                    <span className="font-mono text-sm font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                      {formatAmount(active.amount, active.currency)}
                    </span>
                  ) : (
                    <span className="text-xs italic text-zinc-400 dark:text-zinc-500">
                      {t("price.noPrice")}
                    </span>
                  )}
                  {active?.stripePriceId && (
                    <p className="mt-0.5 font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                      {active.stripePriceId}
                    </p>
                  )}
                </div>

                {/* Status + actions */}
                <div className="flex shrink-0 items-center gap-2">
                  {active ? (
                    <>
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                        {t("price.active")}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
                        onClick={() => handleDeactivate(active)}
                        disabled={deactivatingId === active.id}
                      >
                        {deactivatingId === active.id ? t("price.deactivating") : t("price.deactivate")}
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                      onClick={() => {
                        setLockedCurrency(c.value)
                        setAddPriceOpen(true)
                      }}
                    >
                      <Plus className="size-3" aria-hidden="true" />
                      {t("price.set")}
                    </Button>
                  )}

                  {hasHistory && (
                    <button
                      type="button"
                      onClick={() => toggleHistory(c.value)}
                      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                      aria-expanded={isHistoryOpen}
                      aria-label={`${t("price.history")} ${c.value}`}
                    >
                      <History className="size-3" aria-hidden="true" />
                      {history.length}
                      <ChevronDown
                        className={cn("size-3 transition-transform", isHistoryOpen && "rotate-180")}
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Price history — inline expandable */}
              {isHistoryOpen && hasHistory && (
                <div className="border-t border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
                  <div className="px-4 pb-2 pt-1.5">
                    <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      {t("price.historyTitle")}
                    </p>
                    <div className="space-y-1">
                      {history
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                        )
                        .map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-3 rounded px-2 py-1.5 text-xs"
                          >
                            <span className="w-28 font-mono font-medium tabular-nums text-zinc-500 line-through dark:text-zinc-500">
                              {formatAmount(p.amount, p.currency)}
                            </span>
                            {p.stripePriceId && (
                              <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
                                {p.stripePriceId}
                              </span>
                            )}
                            <span className="ml-auto text-[10px] text-zinc-400 dark:text-zinc-500">
                              {new Date(p.createdAt).toLocaleDateString("es-MX", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
                              {t("price.inactive")}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <AddPriceModal
        open={addPriceOpen}
        planName={plan.name}
        isLoading={isAddingPrice}
        lockedCurrency={lockedCurrency}
        activePricesByCurrency={Object.fromEntries(
          CURRENCIES.map((c) => [c.value, pricesByCurrency[c.value]?.active ?? null])
        )}
        onOpenChange={setAddPriceOpen}
        onSave={handleAddPrice}
      />
    </div>
  )
}
