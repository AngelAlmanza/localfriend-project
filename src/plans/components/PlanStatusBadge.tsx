import { cn } from "@/lib/utils"

interface PlanStatusBadgeProps {
  isActive: boolean
  size?: "sm" | "default"
  className?: string
}

export const PlanStatusBadge = ({ isActive, size = "default", className }: PlanStatusBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium tabular-nums",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        isActive
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isActive ? "bg-emerald-500 dark:bg-emerald-400" : "bg-zinc-400 dark:bg-zinc-500",
        )}
        aria-hidden="true"
      />
      {isActive ? "Activo" : "Inactivo"}
    </span>
  )
}
