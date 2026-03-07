"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ServiceCategoryResponse } from "@/src/service-categories/interfaces/responses";
import { LoadingIcon } from "@/src/shared/components/LoadingIcon";
import { createClient } from "@/src/shared/lib/supabase/client";
import { useUserContext } from "@/src/shared/providers/UserProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ServiceResponse } from "../../interfaces/responses";
import {
  buildServiceSchema,
  type ServiceSchema,
} from "../../schemas/service.schema";
import { ServicesService } from "../../services/ServicesService";
import { ServiceVariantsField } from "./ServiceVariantsField";

const FORM_ID = "service-form";

interface ServiceFormProps {
  service?: ServiceResponse | null;
  categories: ServiceCategoryResponse[];
}

export function ServiceForm({ service, categories }: ServiceFormProps) {
  const t = useTranslations("Workers.listings.services");
  const router = useRouter();
  const { user } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!service;

  const schema = buildServiceSchema({
    nameMin: t("form.nameMin"),
    nameMax: t("form.nameMax"),
    descriptionMax: t("form.descriptionMax"),
    categoryRequired: t("form.categoryRequired"),
    variantNameRequired: t("form.variantNameRequired"),
    variantNameMax: t("form.variantNameMax"),
    priceNonNegative: t("form.priceNonNegative"),
  });

  const form = useForm<ServiceSchema>({
    resolver: zodResolver(schema),
    defaultValues: service
      ? {
          name: service.name,
          description: service.description ?? "",
          serviceCategoryId: service.serviceCategoryId,
          basePriceMin: service.basePriceMin,
          basePriceMax: service.basePriceMax,
          variants: service.variants.map((v) => ({
            id: v.id,
            name: v.name,
            priceMin: v.priceMin,
            priceMax: v.priceMax,
          })),
          deletedVariantIds: [],
        }
      : {
          name: "",
          description: "",
          serviceCategoryId: "",
          basePriceMin: null,
          basePriceMax: null,
          variants: [],
          deletedVariantIds: [],
        },
  });

  const onSubmit = async (values: ServiceSchema) => {
    if (!user) return;
    setIsLoading(true);
    const supabase = createClient();

    const result = isEditing
      ? await ServicesService.updateService(
          {
            id: service!.id,
            name: values.name,
            description: values.description || null,
            serviceCategoryId: values.serviceCategoryId,
            basePriceMin: values.basePriceMin ?? null,
            basePriceMax: values.basePriceMax ?? null,
            variants: values.variants.map((v) => ({
              id: v.id,
              name: v.name,
              priceMin: v.priceMin ?? null,
              priceMax: v.priceMax ?? null,
            })),
            deletedVariantIds: values.deletedVariantIds,
          },
          supabase,
        )
      : await ServicesService.createService(
          {
            name: values.name,
            description: values.description || null,
            serviceCategoryId: values.serviceCategoryId,
            basePriceMin: values.basePriceMin ?? null,
            basePriceMax: values.basePriceMax ?? null,
            workerId: user.id,
            variants: values.variants.map((v) => ({
              name: v.name,
              priceMin: v.priceMin ?? null,
              priceMax: v.priceMax ?? null,
            })),
          },
          supabase,
        );

    setIsLoading(false);

    if (result.left) {
      toast.error(
        result.left.message ??
          t(isEditing ? "form.updateFailed" : "form.creationFailed"),
      );
    } else {
      toast.success(
        t(isEditing ? "form.updatedSuccessfully" : "form.createdSuccessfully"),
      );
      router.push("/workers/services");
      router.refresh();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditing ? t("form.editTitle") : t("form.createTitle")}
        </h1>
      </div>

      <FormProvider {...form}>
        <form
          id={FORM_ID}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="rounded-lg border bg-card shadow-sm p-6">
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${FORM_ID}-name`}>
                      {t("form.name")}
                    </FieldLabel>
                    <Input
                      id={`${FORM_ID}-name`}
                      {...field}
                      placeholder={t("form.namePlaceholder")}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      data-testid="service-name"
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
                    <FieldLabel htmlFor={`${FORM_ID}-description`}>
                      {t("form.description")}
                    </FieldLabel>
                    <Textarea
                      id={`${FORM_ID}-description`}
                      {...field}
                      placeholder={t("form.descriptionPlaceholder")}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      rows={3}
                      data-testid="service-description"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="serviceCategoryId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t("form.category")}</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        aria-invalid={fieldState.invalid}
                        data-testid="service-category"
                      >
                        <SelectValue
                          placeholder={t("form.categoryPlaceholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="basePriceMin"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${FORM_ID}-basePriceMin`}>
                        {t("form.basePriceMin")}
                      </FieldLabel>
                      <Input
                        id={`${FORM_ID}-basePriceMin`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.value?.toString() ?? ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        onBlur={field.onBlur}
                        placeholder={t("form.basePriceMinPlaceholder")}
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        data-testid="service-price-min"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="basePriceMax"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${FORM_ID}-basePriceMax`}>
                        {t("form.basePriceMax")}
                      </FieldLabel>
                      <Input
                        id={`${FORM_ID}-basePriceMax`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.value?.toString() ?? ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        onBlur={field.onBlur}
                        placeholder={t("form.basePriceMaxPlaceholder")}
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        data-testid="service-price-max"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          </div>

          <div className="rounded-lg border bg-card shadow-sm p-6">
            <ServiceVariantsField
              labels={{
                title: t("variants.title"),
                addButton: t("variants.addButton"),
                name: t("variants.name"),
                namePlaceholder: t("variants.namePlaceholder"),
                priceMin: t("variants.priceMin"),
                priceMinPlaceholder: t("variants.priceMinPlaceholder"),
                priceMax: t("variants.priceMax"),
                priceMaxPlaceholder: t("variants.priceMaxPlaceholder"),
                delete: t("variants.delete"),
                noVariants: t("variants.noVariants"),
                optional: t("variants.optional"),
              }}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/workers/services">{t("form.cancel")}</Link>
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              data-testid="service-submit"
            >
              {isLoading && <LoadingIcon />}
              {isLoading ? t("form.saving") : t("form.save")}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
