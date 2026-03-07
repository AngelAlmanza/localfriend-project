"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { ProductCategoryResponse } from "@/src/product-categories/interfaces/responses";
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
import type { ProductResponse } from "../../interfaces/responses";
import {
  buildProductSchema,
  type ProductSchema,
} from "../../schemas/product.schema";
import { ProductsService } from "../../services/ProductsService";
import { ProductVariantsField } from "./ProductVariantsField";

const FORM_ID = "product-form";

interface ProductFormProps {
  product?: ProductResponse | null;
  categories: ProductCategoryResponse[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const t = useTranslations("Workers.listings.products");
  const router = useRouter();
  const { user } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!product;

  const schema = buildProductSchema({
    nameMin: t("form.nameMin"),
    nameMax: t("form.nameMax"),
    descriptionMax: t("form.descriptionMax"),
    categoryRequired: t("form.categoryRequired"),
    variantsMin: t("form.variantsMin"),
    variantNameRequired: t("form.variantNameRequired"),
    variantNameMax: t("form.variantNameMax"),
    variantPriceRequired: t("form.variantPriceRequired"),
    variantPricePositive: t("form.variantPricePositive"),
  });

  const form = useForm<ProductSchema>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description ?? "",
          productCategoryId: product.productCategoryId,
          isImmediate: product.isImmediate,
          variants: product.variants.map((v) => ({
            id: v.id,
            name: v.name,
            price: v.price,
          })),
          deletedVariantIds: [],
        }
      : {
          name: "",
          description: "",
          productCategoryId: "",
          isImmediate: false,
          variants: [],
          deletedVariantIds: [],
        },
  });

  const onSubmit = async (values: ProductSchema) => {
    if (!user) return;
    setIsLoading(true);
    const supabase = createClient();

    const result = isEditing
      ? await ProductsService.updateProduct(
          {
            id: product!.id,
            name: values.name,
            description: values.description || null,
            productCategoryId: values.productCategoryId,
            isImmediate: values.isImmediate,
            variants: values.variants,
            deletedVariantIds: values.deletedVariantIds,
          },
          supabase,
        )
      : await ProductsService.createProduct(
          {
            name: values.name,
            description: values.description || null,
            productCategoryId: values.productCategoryId,
            isImmediate: values.isImmediate,
            workerId: user.id,
            variants: values.variants,
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
      router.push("/workers/products");
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
                      data-testid="product-name"
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
                      data-testid="product-description"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="productCategoryId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t("form.category")}</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        aria-invalid={fieldState.invalid}
                        data-testid="product-category"
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

              <Controller
                control={form.control}
                name="isImmediate"
                render={({ field }) => (
                  <Field>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`${FORM_ID}-isImmediate`}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="product-is-immediate"
                      />
                      <div className="space-y-0.5">
                        <FieldLabel
                          htmlFor={`${FORM_ID}-isImmediate`}
                          className="leading-none"
                        >
                          {t("form.isImmediate")}
                        </FieldLabel>
                        <p className="text-xs text-muted-foreground">
                          {t("form.isImmediateDescription")}
                        </p>
                      </div>
                    </div>
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          <div className="rounded-lg border bg-card shadow-sm p-6">
            <ProductVariantsField
              labels={{
                title: t("variants.title"),
                addButton: t("variants.addButton"),
                name: t("variants.name"),
                namePlaceholder: t("variants.namePlaceholder"),
                price: t("variants.price"),
                pricePlaceholder: t("variants.pricePlaceholder"),
                delete: t("variants.delete"),
                noVariants: t("variants.noVariants"),
                minRequired: t("variants.minRequired"),
              }}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/workers/products">{t("form.cancel")}</Link>
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              data-testid="product-submit"
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
