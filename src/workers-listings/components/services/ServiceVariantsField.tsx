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
import type { ServiceSchema } from "@/src/workers-listings/schemas/service.schema";

interface ServiceVariantsFieldLabels {
  title: string;
  addButton: string;
  name: string;
  namePlaceholder: string;
  priceMin: string;
  priceMinPlaceholder: string;
  priceMax: string;
  priceMaxPlaceholder: string;
  delete: string;
  noVariants: string;
  optional: string;
}

interface ServiceVariantsFieldProps {
  labels: ServiceVariantsFieldLabels;
}

export function ServiceVariantsField({ labels }: ServiceVariantsFieldProps) {
  const form = useFormContext<ServiceSchema>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

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
          <p className="text-xs text-muted-foreground mt-0.5">
            {labels.optional}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: "", priceMin: null, priceMax: null })}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          {labels.addButton}
        </Button>
      </div>

      {fields.length === 0 ? (
        <div
          className="rounded-lg border-2 border-dashed border-border py-6 text-center"
          role="status"
        >
          <p className="text-sm text-muted-foreground">{labels.noVariants}</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{labels.name}</TableHead>
                <TableHead className="w-36">{labels.priceMin}</TableHead>
                <TableHead className="w-36">{labels.priceMax}</TableHead>
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
                            data-testid={`svc-variant-name-${index}`}
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
                      name={`variants.${index}.priceMin`}
                      render={({ field: f, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <Input
                            {...f}
                            type="number"
                            value={f.value?.toString() ?? ""}
                            onChange={(e) => f.onChange(Number(e.target.value))}
                            step="0.01"
                            min="0"
                            placeholder={labels.priceMinPlaceholder}
                            aria-label={`${labels.priceMin} ${index + 1}`}
                            aria-invalid={fieldState.invalid}
                            autoComplete="off"
                            data-testid={`svc-variant-price-min-${index}`}
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
                      name={`variants.${index}.priceMax`}
                      render={({ field: f, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <Input
                            {...f}
                            type="number"
                            value={f.value?.toString() ?? ""}
                            onChange={(e) => f.onChange(Number(e.target.value))}
                            step="0.01"
                            min="0"
                            placeholder={labels.priceMaxPlaceholder}
                            aria-label={`${labels.priceMax} ${index + 1}`}
                            aria-invalid={fieldState.invalid}
                            autoComplete="off"
                            data-testid={`svc-variant-price-max-${index}`}
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
                      data-testid={`svc-variant-delete-${index}`}
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
