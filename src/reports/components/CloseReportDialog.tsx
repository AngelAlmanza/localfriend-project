"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { buildCloseReportSchema, CloseReportSchema } from "@/src/reports/schemas/report.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import type { CloseReportInput, Report } from "../interfaces/Report"

interface CloseReportDialogProps {
  open: boolean
  onClose: () => void
  report: Report
  onConfirm: (input: CloseReportInput) => Promise<void>
}

export const CloseReportDialog = ({
  open,
  onClose,
  report,
  onConfirm,
}: CloseReportDialogProps) => {
  const t = useTranslations("Reports.admin.detail")

  const schema = useMemo(
    () =>
      buildCloseReportSchema({
        resultRequired: t("resultLabel"),
      }),
    [t],
  )

  const resultOptions = useMemo(() => [
    { value: "approved", label: t("approve") },
    { value: "rejected", label: t("reject") },
    { value: "not_applicable", label: t("notApplicable") },
  ], [t])

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CloseReportSchema>({
    resolver: zodResolver(schema),
  })

  const result = watch("result")

  const hasReportedUser = !!report.reportedUserId
  const hasListing = !!(report.productId || report.serviceId)
  const listingId = report.productId ?? report.serviceId ?? undefined
  const listingType: "product" | "service" | undefined = report.productId
    ? "product"
    : report.serviceId
      ? "service"
      : undefined

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = async (values: CloseReportSchema) => {
    await onConfirm({
      reportId: report.id,
      result: values.result,
      deactivateUser: values.deactivateUser ?? false,
      hideListingId: values.hideListingId,
      hideListingType: values.hideListingType,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("closeReport")}</DialogTitle>
          <DialogDescription className="text-xs">
            ID del reporte: {report.id.slice(0, 8)}...
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
          {/* Result selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("resultLabel")}</Label>
            <Controller
              name="result"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="space-y-2"
                >
                  {
                    resultOptions.map((opt) => (
                      <div key={opt.value} className="flex items-start gap-2.5">
                        <RadioGroupItem value={opt.value} id={opt.value} className="mt-0.5" />
                        <Label
                          htmlFor={opt.value}
                          className="text-sm font-normal leading-tight cursor-pointer"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))
                  }
                </RadioGroup>
              )}
            />
            {errors.result && (
              <p className="text-xs text-red-500">{errors.result.message}</p>
            )}
          </div>

          {/* Moderation actions — only available when approved */}
          {result === "approved" && (
            <div className="space-y-3 rounded-lg border border-red-100 bg-red-50/50 p-3">
              <p className="text-xs font-medium text-red-700">{t("actions")}</p>

              {hasReportedUser && (
                <Controller
                  name="deactivateUser"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="deactivate"
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                      <Label
                        htmlFor="deactivate"
                        className="text-xs font-normal cursor-pointer leading-snug"
                      >
                        {t("deactivateUser")}{" "}
                        <span className="text-gray-500">({report.reportedUserName})</span>
                      </Label>
                    </div>
                  )}
                />
              )}

              {hasListing && (
                <Controller
                  name="hideListingId"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="hideListing"
                        checked={field.value === listingId}
                        onCheckedChange={(checked) => {
                          field.onChange(checked ? listingId : undefined)
                        }}
                      />
                      <Label
                        htmlFor="hideListing"
                        className="text-xs font-normal cursor-pointer leading-snug"
                      >
                        {t("hideListing")}{" "}
                        <span className="text-gray-500">
                          ({report.productName ?? report.serviceName})
                        </span>
                      </Label>
                    </div>
                  )}
                />
              )}

              {/* Hidden field for listing type — kept in sync */}
              {hasListing && listingType && (
                <Controller
                  name="hideListingType"
                  control={control}
                  render={({ field }) => {
                    // Sync the type whenever hideListingId changes
                    const hideId = watch("hideListingId")
                    if (hideId && field.value !== listingType) {
                      field.onChange(listingType)
                    }
                    return <></>
                  }}
                />
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="destructive"
              disabled={isSubmitting || !result}
            >
              {isSubmitting && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
              {t("confirm")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
