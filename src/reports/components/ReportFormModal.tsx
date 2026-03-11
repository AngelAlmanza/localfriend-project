"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { buildReportSchema, ReportSchema } from "@/src/reports/schemas/report.schema"
import { ReportsService } from "@/src/reports/services/ReportsService"
import { LoadingIcon } from "@/src/shared/components/LoadingIcon"
import { createClient } from "@/src/shared/lib/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle, CheckCircle2, Paperclip, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import type { ReportTargetType } from "../interfaces/Report"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

interface ReportFormModalProps {
  open: boolean
  onClose: () => void
  reporterId: string
  targetType: ReportTargetType
  productId?: string
  serviceId?: string
  reportedUserId?: string
  targetName?: string
}

export const ReportFormModal = ({
  open,
  onClose,
  reporterId,
  targetType,
  productId,
  serviceId,
  reportedUserId,
  targetName,
}: ReportFormModalProps) => {
  const t = useTranslations("Reports.form")
  const supabase = useMemo(() => createClient(), [])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const schema = useMemo(
    () =>
      buildReportSchema({
        reasonMin: t("reasonMin"),
        reasonMax: t("reasonMax"),
        evidencesMax: t("evidencesMax"),
      }),
    [t],
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReportSchema>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "" },
  })

  const handleClose = () => {
    reset()
    setFiles([])
    setFileErrors([])
    setSubmitted(false)
    setSubmitError(null)
    onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    const errors: string[] = []
    const valid: File[] = []

    for (const file of selected) {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" ${t("fileTooLarge")}`)
      } else {
        valid.push(file)
      }
    }

    setFileErrors(errors)
    setFiles((prev) => {
      const combined = [...prev, ...valid]
      return combined.slice(0, 5)
    })
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (values: ReportSchema) => {
    setSubmitError(null)

    const { right, left } = await ReportsService.createReport(
      {
        reporterId,
        targetType,
        productId,
        serviceId,
        reportedUserId,
        reason: values.reason,
        evidenceFiles: files.length > 0 ? files : undefined,
      },
      supabase,
    )

    if (left) {
      setSubmitError(t("errorMessage"))
      return
    }

    // Trigger admin email notification via API route (fire-and-forget)
    fetch("/api/reports/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "new_report", reportId: right!.id }),
    }).catch(() => { })

    setSubmitted(true)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex items-center justify-center size-14 rounded-full bg-green-50">
              <CheckCircle2 className="size-7 text-green-600" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">{t("successTitle")}</p>
              <p className="text-sm text-gray-500">{t("successMessage")}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleClose}>
              {t("submitted")}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-500" />
                {t("title")}
              </DialogTitle>
              <DialogDescription>
                {targetName ? (
                  <>
                    {t("subtitle")}{" "}
                    <span className="font-medium text-gray-700">&ldquo;{targetName}&rdquo;</span>
                  </>
                ) : (
                  t("subtitle")
                )}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              {/* Reason */}
              <div className="space-y-1.5">
                <Label htmlFor="reason">{t("reasonLabel")}</Label>
                <Controller
                  name="reason"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="reason"
                      rows={4}
                      placeholder={t("reasonPlaceholder")}
                      className="resize-none text-sm"
                    />
                  )}
                />
                {errors.reason && (
                  <p className="text-xs text-red-500">{errors.reason.message}</p>
                )}
              </div>

              {/* Evidences */}
              <div className="space-y-1.5">
                <Label>{t("evidencesLabel")}</Label>
                <p className="text-xs text-gray-400">{t("evidencesHint")}</p>

                {fileErrors.length > 0 && (
                  <ul className="space-y-0.5">
                    {fileErrors.map((err, i) => (
                      <li key={i} className="text-xs text-red-500">{err}</li>
                    ))}
                  </ul>
                )}

                {files.length > 0 && (
                  <ul className="space-y-1">
                    {files.map((file, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-2 rounded-md border border-gray-100 bg-gray-50 px-3 py-1.5 text-xs"
                      >
                        <span className="truncate text-gray-600 max-w-[220px]">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                        >
                          <X className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {files.length < 5 && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="size-3.5" />
                      {t("evidencesButton")}
                    </Button>
                  </>
                )}
              </div>

              {submitError && (
                <p className="text-xs text-red-500">{submitError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
                  {t("cancel")}
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting && <LoadingIcon />}
                  {t("submit")}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
