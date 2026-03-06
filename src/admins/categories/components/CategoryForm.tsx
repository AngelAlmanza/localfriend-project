"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LoadingIcon } from "@/src/shared/components/LoadingIcon"
import { ISystemError } from "@/src/shared/interfaces/ISystemError"
import { createClient } from "@/src/shared/lib/supabase/client"
import { StorageService } from "@/src/shared/services/StorageService"
import { Either } from "@/src/shared/types/either"
import { getFileName } from "@/src/shared/utils/getFileName"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { buildCategorySchema, CategorySchema } from "../schema/category.schema"
import { CategoryItem, CategorySaveDTO } from "../types"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const FORM_ID = "category-form"

interface CategoryFormProps {
  initialValues: CategorySchema
  id: string | null
  bucketName: string
  onSave: (dto: CategorySaveDTO) => Promise<Either<ISystemError, CategoryItem>>
  onSuccess?: () => void
}

export const CategoryForm = ({ initialValues, id, bucketName, onSave, onSuccess }: CategoryFormProps) => {
  const t = useTranslations("Admins.categories.form")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<CategorySchema>({
    resolver: zodResolver(buildCategorySchema({
      nameMinErrorMessage: t("nameMinErrorMessage"),
      nameMaxErrorMessage: t("nameMaxErrorMessage"),
      descriptionMinErrorMessage: t("descriptionMinErrorMessage"),
      descriptionMaxErrorMessage: t("descriptionMaxErrorMessage"),
    })),
    defaultValues: initialValues,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (file && file.size > MAX_FILE_SIZE) {
      setFileError(t("imageFileTooLargeErrorMessage"))
      e.target.value = ""
      setSelectedFile(null)
      return
    }
    setFileError(null)
    setSelectedFile(file)
  }

  const onSubmit = async (values: CategorySchema) => {
    const existingImageUrl = values.imageUrl ?? ""

    if (!selectedFile && !existingImageUrl) {
      setFileError(t("imageRequired"))
      return
    }

    setIsLoading(true)
    const supabase = createClient()
    let imageUrl = existingImageUrl

    if (selectedFile) {
      const ext = selectedFile.name.split(".").pop()
      const path = getFileName(ext ?? "")
      const { left: uploadError, right: uploadedUrl } = await StorageService.uploadFile(
        selectedFile,
        bucketName,
        path,
        supabase,
      )

      if (uploadError) {
        toast.error(uploadError.message)
        setIsLoading(false)
        return
      }

      if (id && existingImageUrl) {
        const oldPath = StorageService.getPathFromUrl(existingImageUrl, bucketName)
        if (oldPath) await StorageService.deleteFile(bucketName, oldPath, supabase)
      }

      imageUrl = uploadedUrl!
    }

    const { left, right } = await onSave({ id, name: values.name, description: values.description ?? "", imageUrl })
    if (right) {
      toast.success(t(id ? "updatedSuccessfully" : "createdSuccessfully"))
      onSuccess?.()
    } else {
      toast.error(left?.message ?? t(id ? "updateFailed" : "creationFailed"))
    }
    setIsLoading(false)
  }

  return (
    <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${FORM_ID}-name`}>{t("name")}</FieldLabel>
              <Input
                id={`${FORM_ID}-name`}
                {...field}
                placeholder={t("namePlaceholder")}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${FORM_ID}-description`}>{t("description")}</FieldLabel>
              <Textarea
                id={`${FORM_ID}-description`}
                {...field}
                placeholder={t("descriptionPlaceholder")}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                rows={4}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Field data-invalid={!!fileError}>
          <FieldLabel htmlFor={`${FORM_ID}-image`}>{t("imageUrl")}</FieldLabel>
          {initialValues.imageUrl && (
            <div className="w-full h-38 relative">
              <Image
                src={initialValues.imageUrl}
                alt="Current category image"
                fill
                className="object-cover rounded-md mb-2"
              />
            </div>
          )}
          <Input
            id={`${FORM_ID}-image`}
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
          />
          {fileError && (
            <FieldError errors={[{ message: fileError }]} />
          )}
        </Field>
      </FieldGroup>
      <Button type="submit" form={FORM_ID} variant="primary" disabled={isLoading} className="mt-4 w-full">
        {t("save")}
        {isLoading && <LoadingIcon />}
      </Button>
    </form>
  )
}
