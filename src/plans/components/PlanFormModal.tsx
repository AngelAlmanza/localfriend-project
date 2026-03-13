"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { LoadingIcon } from "@/src/shared/components/LoadingIcon"
import { buildPlanSchema, PlanSchema } from "@/src/plans/schemas/plan.schema"
import type { Plan } from "@/src/plans/interfaces/Plan"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"

interface PlanFormModalProps {
  open: boolean
  plan: Plan | null
  isLoading: boolean
  onOpenChange: (open: boolean) => void
  onSave: (values: PlanSchema) => Promise<void>
}

export const PlanFormModal = ({
  open,
  plan,
  isLoading,
  onOpenChange,
  onSave,
}: PlanFormModalProps) => {
  const t = useTranslations("Admins.plans")
  const isEditing = plan !== null

  const schema = useMemo(
    () =>
      buildPlanSchema({
        nameRequired: t("form.nameRequired"),
        nameMin: t("form.nameMin"),
        nameMax: t("form.nameMax"),
        featureRequired: t("form.featureRequired"),
      }),
    [t],
  )

  const form = useForm<PlanSchema>({
    resolver: zodResolver(schema),
    defaultValues: plan
      ? {
        name: plan.name,
        description: plan.description ?? "",
        features: plan.features.length > 0 ? plan.features : [""],
        billingInterval: (plan.billingInterval as "month" | "year") ?? "month",
        isActive: plan.isActive,
      }
      : {
        name: "",
        description: "",
        features: [""],
        billingInterval: "month",
        isActive: true,
      },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    // @ts-expect-error — features is string[], react-hook-form expects objects
    name: "features",
  })

  const handleSubmit = async (values: PlanSchema) => {
    await onSave(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {isEditing ? t("form.editTitle") : t("form.addTitle")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            {/* Name */}
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="plan-name">{t("form.name")}</FieldLabel>
                  <Input
                    id="plan-name"
                    placeholder={t("form.namePlaceholder")}
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Description */}
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="plan-description">
                    {t("form.description")}
                    <span className="ml-1 text-xs font-normal text-zinc-400">
                      ({t("form.optional")})
                    </span>
                  </FieldLabel>
                  <Textarea
                    id="plan-description"
                    placeholder={t("form.descriptionPlaceholder")}
                    rows={2}
                    className="resize-none"
                    {...field}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Billing interval */}
            <Controller
              control={form.control}
              name="billingInterval"
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("form.billingInterval")}</FieldLabel>
                  <div className="flex gap-2">
                    {(["month", "year"] as const).map((interval) => (
                      <button
                        key={interval}
                        type="button"
                        onClick={() => field.onChange(interval)}
                        className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${field.value === interval
                          ? "border-primary bg-primary text-primary-foreground dark:border-primary dark:bg-primary dark:text-primary-foreground"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
                          }`}
                      >
                        {interval === "month" ? t("form.monthly") : t("form.annual")}
                      </button>
                    ))}
                  </div>
                </Field>
              )}
            />

            {/* Features */}
            <Field>
              <FieldLabel>{t("form.features")}</FieldLabel>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      placeholder={t("form.featurePlaceholder")}
                      {...form.register(`features.${index}` as const)}
                      className="flex-1"
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => remove(index)}
                        aria-label={t("form.removeFeature")}
                        className="shrink-0"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append("")}
                className="mt-1 w-fit"
              >
                <Plus className="size-4" aria-hidden="true" />
                {t("form.addFeature")}
              </Button>
            </Field>

            {/* isActive — only when editing */}
            {isEditing && (
              <Controller
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <Field>
                    <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
                      <div>
                        <FieldLabel className="mb-0">{t("form.active")}</FieldLabel>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {t("form.activeDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label={t("form.active")}
                      />
                    </div>
                  </Field>
                )}
              />
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t("form.cancel")}
              </Button>
              <Button type="submit" variant="primary" disabled={isLoading}>
                {t("form.save")}
                {isLoading && <LoadingIcon />}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
