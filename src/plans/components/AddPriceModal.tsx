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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingIcon } from "@/src/shared/components/LoadingIcon"
import type { Price } from "@/src/plans/interfaces/Plan"
import { buildPriceSchema, PriceSchema } from "@/src/plans/schemas/plan.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

const CURRENCIES = [
  { value: "MXN", flag: "🇲🇽", name: "Peso mexicano" },
  { value: "COP", flag: "🇨🇴", name: "Peso colombiano" },
  { value: "PEN", flag: "🇵🇪", name: "Sol peruano" },
  { value: "ARS", flag: "🇦🇷", name: "Peso argentino" },
  { value: "CLP", flag: "🇨🇱", name: "Peso chileno" },
  { value: "UYU", flag: "🇺🇾", name: "Peso uruguayo" },
  { value: "BRL", flag: "🇧🇷", name: "Real brasileño" },
  { value: "VEF", flag: "🇻🇪", name: "Bolívar venezolano" },
  { value: "USD", flag: "🇺🇸", name: "Dólar estadounidense" },
]

interface AddPriceModalProps {
  open: boolean
  planName: string
  isLoading: boolean
  /** null → select libre. string → moneda fija (deshabilitada) */
  lockedCurrency: string | null
  activePricesByCurrency: Record<string, Price | null>
  onOpenChange: (open: boolean) => void
  onSave: (values: PriceSchema) => Promise<void>
}

export const AddPriceModal = ({
  open,
  planName,
  isLoading,
  lockedCurrency,
  activePricesByCurrency,
  onOpenChange,
  onSave,
}: AddPriceModalProps) => {
  const t = useTranslations("Admins.plans")
  const isCurrencyLocked = lockedCurrency !== null

  const schema = useMemo(
    () =>
      buildPriceSchema({
        amountRequired: t("price.amountRequired"),
        amountPositive: t("price.amountPositive"),
        currencyRequired: t("price.currencyRequired"),
      }),
    [t],
  )

  const form = useForm<PriceSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: "",
      amount: undefined,
      label: "",
    },
  })

  // Reset form every time the modal opens, seeding currency from lockedCurrency
  useEffect(() => {
    if (open) {
      form.reset({
        currency: lockedCurrency ?? "",
        amount: undefined,
        label: "",
      })
    }
  }, [open, lockedCurrency]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedCurrency = useWatch({ control: form.control, name: "currency" })
  const conflictingPrice = selectedCurrency ? (activePricesByCurrency[selectedCurrency] ?? null) : null

  const handleSubmit = async (values: PriceSchema) => {
    await onSave(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {t("price.addTitle")}
          </DialogTitle>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("price.addSubtitle", { plan: planName })}
          </p>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            {/* Currency */}
            <Controller
              control={form.control}
              name="currency"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="price-currency">{t("price.currency")}</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    name={field.name}
                    disabled={isCurrencyLocked}
                  >
                    <SelectTrigger
                      id="price-currency"
                      aria-invalid={fieldState.invalid}
                      disabled={isCurrencyLocked}
                      className={isCurrencyLocked ? "opacity-70 cursor-not-allowed" : ""}
                    >
                      <SelectValue placeholder={t("price.currencyPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <span aria-hidden="true">{c.flag}</span>
                          <span className="font-mono font-medium">{c.value}</span>
                          <span className="text-zinc-500">– {c.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Warning: active price exists for selected currency */}
            {conflictingPrice && (
              <div className="flex gap-2.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800/50 dark:bg-amber-950/40">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                <div className="text-xs text-amber-800 dark:text-amber-300">
                  <p className="font-medium">{t("price.conflictWarningTitle")}</p>
                  <p className="mt-0.5 text-amber-700 dark:text-amber-400">
                    {t("price.conflictWarningDescription", {
                      currency: conflictingPrice.currency,
                      amount: conflictingPrice.amount.toFixed(2),
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Amount */}
            <Controller
              control={form.control}
              name="amount"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="price-amount">{t("price.amount")}</FieldLabel>
                  <Input
                    id="price-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    aria-invalid={fieldState.invalid}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    className="font-mono"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Label (optional) */}
            <Controller
              control={form.control}
              name="label"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="price-label">
                    {t("price.label")}
                    <span className="ml-1 text-xs font-normal text-zinc-400">
                      ({t("form.optional")})
                    </span>
                  </FieldLabel>
                  <Input
                    id="price-label"
                    placeholder={t("price.labelPlaceholder")}
                    {...field}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
              {t("price.stripeNote")}
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t("form.cancel")}
              </Button>
              <Button type="submit" variant="primary" disabled={isLoading}>
                {t("price.save")}
                {isLoading && <LoadingIcon />}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
