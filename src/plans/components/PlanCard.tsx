import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Plan } from "@/src/plans/interfaces/Plan"
import { CheckCircle2, ChevronRight, CircleDollarSign } from "lucide-react"
import { PlanStatusBadge } from "./PlanStatusBadge"

interface PlanCardProps {
  plan: Plan
  isSelected: boolean
  onSelect: (plan: Plan) => void
}

export const PlanCard = ({ plan, isSelected, onSelect }: PlanCardProps) => {
  const activePrices = plan.prices?.filter((p) => p.isActive) ?? []
  const currencies = activePrices.map((p) => p.currency)

  return (
    <button
      type="button"
      onClick={() => onSelect(plan)}
      className={cn(
        "w-full text-left rounded-lg border p-4 transition-all duration-150",
        "hover:border-zinc-400 dark:hover:border-zinc-500",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected
          ? "border-zinc-900 bg-zinc-50 dark:border-zinc-400 dark:bg-zinc-900"
          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {plan.name}
            </span>
            <PlanStatusBadge isActive={plan.isActive} size="sm" />
          </div>
          {plan.description && (
            <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
              {plan.description}
            </p>
          )}
        </div>
        <ChevronRight
          className={cn(
            "mt-0.5 size-4 shrink-0 text-zinc-400 transition-transform",
            isSelected && "rotate-90 text-zinc-700 dark:text-zinc-300",
          )}
          aria-hidden="true"
        />
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1">
          <CircleDollarSign className="size-3.5" aria-hidden="true" />
          {activePrices.length} {activePrices.length === 1 ? "precio" : "precios"}
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
          {plan.features.length} {plan.features.length === 1 ? "beneficio" : "beneficios"}
        </span>
      </div>

      {currencies.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {currencies.map((c) => (
            <Badge
              key={c}
              variant="outline"
              className="px-1.5 py-0 font-mono text-[10px] tracking-wide"
            >
              {c}
            </Badge>
          ))}
        </div>
      )}
    </button>
  )
}
