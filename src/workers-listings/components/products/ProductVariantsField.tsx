"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import type { ProductSchema } from "@/src/workers-listings/schemas/product.schema";

interface ProductVariantsFieldLabels {
  title: string;
  addButton: string;
  name: string;
  namePlaceholder: string;
  price: string;
  pricePlaceholder: string;
  delete: string;
  noVariants: string;
  minRequired: string;
}

interface ProductVariantsFieldProps {
  labels: ProductVariantsFieldLabels;
}

export function ProductVariantsField({ labels }: ProductVariantsFieldProps) {
  const form = useFormContext<ProductSchema>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const arrayError = form.formState.errors.variants;

  const handleRemove = (index: number) => {
    const variantId = form.getValues(`variants.${index}.id`);
    if (variantId) {
      const current = form.getValues("deletedVariantIds") ?? [];
      form.setValue("deletedVariantIds", [...current, variantId], {
        shouldDirty: true,
      });
    }
    remove(index);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{labels.title}</h3>
          {typeof arrayError?.message === "string" && (
            <p className="text-xs text-destructive mt-0.5" role="alert">
              {arrayError.message}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: "", price: 0 })}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          {labels.addButton}
        </Button>
      </div>

      {fields.length === 0 ? (
        <div
          className="rounded-lg border-2 border-dashed border-border py-8 text-center"
          role="status"
        >
          <p className="text-sm font-medium text-muted-foreground">
            {labels.noVariants}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {labels.minRequired}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{labels.name}</TableHead>
                <TableHead className="w-40">{labels.price}</TableHead>
                <TableHead className="w-12 text-right">
                  <span className="sr-only">{labels.delete}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell className="py-2 align-top">
                    <Controller
                      control={form.control}
                      name={`variants.${index}.name`}
                      render={({ field: f, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <Input
                            {...f}
                            placeholder={labels.namePlaceholder}
                            aria-label={`${labels.name} ${index + 1}`}
                            aria-invalid={fieldState.invalid}
                            autoComplete="off"
                            data-testid={`variant-name-${index}`}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </TableCell>
                  <TableCell className="py-2 align-top">
                    <Controller
                      control={form.control}
                      name={`variants.${index}.price`}
                      render={({ field: f, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <Input
                            {...f}
                            type="number"
                            value={f.value?.toString() ?? ""}
                            onChange={(e) => f.onChange(Number(e.target.value))}
                            step="0.01"
                            min="0.01"
                            placeholder={labels.pricePlaceholder}
                            aria-label={`${labels.price} ${index + 1}`}
                            aria-invalid={fieldState.invalid}
                            autoComplete="off"
                            data-testid={`variant-price-${index}`}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </TableCell>
                  <TableCell className="py-2 text-right align-top">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemove(index)}
                      aria-label={`${labels.delete} variante ${index + 1}`}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      data-testid={`variant-delete-${index}`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
