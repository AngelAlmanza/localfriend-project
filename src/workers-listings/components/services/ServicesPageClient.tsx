"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EntityStatus } from "@/src/shared/constants/EntityStatus";
import type { IPaginatedResponse } from "@/src/shared/interfaces/IPaginatedResponse";
import { createClient } from "@/src/shared/lib/supabase/client";
import { useUserContext } from "@/src/shared/providers/UserProvider";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import moment from "moment-timezone";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import type { ServiceResponse } from "../../interfaces/responses";
import { ServicesService } from "../../services/ServicesService";
import { ListingDeleteDialog } from "../shared/ListingDeleteDialog";
import { ListingStatusBadge } from "../shared/ListingStatusBadge";
import { ListingTablePagination } from "@/src/shared/components/ListingTablePagination";

interface ServicesPageClientProps {
  initialData: IPaginatedResponse<ServiceResponse>;
}

function formatPriceRange(
  min: number | null,
  max: number | null,
  fallback: string,
): string {
  if (min != null && max != null)
    return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
  if (min != null) return `$${min.toFixed(2)}+`;
  if (max != null) return `$${max.toFixed(2)}`;
  return fallback;
}

export function ServicesPageClient({ initialData }: ServicesPageClientProps) {
  const t = useTranslations("Workers.listings.services");
  const { user } = useUserContext();

  const [data, setData] = useState(initialData);
  const [deleteTarget, setDeleteTarget] = useState<ServiceResponse | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingStatusId, setLoadingStatusId] = useState<string | null>(null);

  const formatDate = (dateStr: string) =>
    moment.tz(dateStr, moment.tz.guess()).format("DD/MM/YYYY HH:mm");

  const loadPage = async (page: number) => {
    if (!user) return;
    const supabase = createClient();
    const { right, left } = await ServicesService.getWorkerServices(
      user.id,
      supabase,
      page,
    );
    if (left) {
      toast.error(left.message);
    } else if (right) {
      setData(right);
    }
  };

  const handleToggleStatus = async (service: ServiceResponse) => {
    const newStatus =
      service.status === EntityStatus.VISIBLE
        ? EntityStatus.HIDDEN
        : EntityStatus.VISIBLE;
    setLoadingStatusId(service.id);
    const supabase = createClient();
    const { left } = await ServicesService.updateServiceStatus(
      { id: service.id, status: newStatus },
      supabase,
    );
    setLoadingStatusId(null);
    if (left) {
      toast.error(left.message ?? t("statusChangeFailed"));
    } else {
      toast.success(t("statusChanged"));
      loadPage(data.page);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const supabase = createClient();
    const { left } = await ServicesService.deleteService(
      deleteTarget.id,
      supabase,
    );
    setIsDeleting(false);
    setDeleteTarget(null);
    if (left) {
      toast.error(left.message ?? t("deleteFailed"));
    } else {
      toast.success(t("deletedSuccessfully"));
      const targetPage =
        data.data.length === 1 && data.page > 1 ? data.page - 1 : data.page;
      loadPage(targetPage);
    }
  };

  const from = (data.page - 1) * data.pageSize + 1;
  const to = Math.min(data.page * data.pageSize, data.total);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("page.title")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("page.subtitle")}
          </p>
        </div>
        <Button variant="primary" asChild>
          <Link href="/workers/services/new">
            <Plus className="size-4" aria-hidden="true" />
            {t("page.addButton")}
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.name")}</TableHead>
              <TableHead className="hidden sm:table-cell">
                {t("table.category")}
              </TableHead>
              <TableHead className="hidden md:table-cell w-40">
                {t("table.priceRange")}
              </TableHead>
              <TableHead className="hidden md:table-cell w-24 text-center">
                {t("table.variants")}
              </TableHead>
              <TableHead className="w-36">{t("table.status")}</TableHead>
              <TableHead className="hidden lg:table-cell w-44">
                {t("table.updatedAt")}
              </TableHead>
              <TableHead className="w-28 text-right">
                {t("table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <span className="text-base font-medium">
                      {t("table.noData")}
                    </span>
                    <span className="text-sm">
                      {t("table.noDataDescription")}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((service) => {
                const isHiddenHard =
                  service.status === EntityStatus.HIDDEN_HARD;
                return (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {service.name}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {service.categoryName}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {formatPriceRange(
                        service.basePriceMin,
                        service.basePriceMax,
                        t("table.noPriceRange"),
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-center text-muted-foreground">
                      {service.variants.length}
                    </TableCell>
                    <TableCell>
                      <ListingStatusBadge
                        status={service.status}
                        label={t(`status.${service.status}`)}
                      />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {formatDate(service.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!isHiddenHard && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleToggleStatus(service)}
                              disabled={loadingStatusId === service.id}
                              aria-label={
                                service.status === EntityStatus.VISIBLE
                                  ? t("table.hide")
                                  : t("table.show")
                              }
                              title={
                                service.status === EntityStatus.VISIBLE
                                  ? t("table.hide")
                                  : t("table.show")
                              }
                            >
                              {service.status === EntityStatus.VISIBLE ? (
                                <EyeOff className="size-4" aria-hidden="true" />
                              ) : (
                                <Eye className="size-4" aria-hidden="true" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              asChild
                              aria-label={t("table.edit")}
                              title={t("table.edit")}
                            >
                              <Link
                                href={`/workers/services/${service.id}/edit`}
                              >
                                <Pencil className="size-4" aria-hidden="true" />
                              </Link>
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteTarget(service)}
                          aria-label={t("table.delete")}
                          title={t("table.delete")}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {data.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {t("page.showing", { from, to, total: data.total })}
          </p>
          <ListingTablePagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={loadPage}
          />
        </div>
      )}

      <ListingDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title={t("deleteDialog.title")}
        description={t("deleteDialog.description", {
          name: deleteTarget?.name ?? "",
        })}
        confirmLabel={t("deleteDialog.confirm")}
        cancelLabel={t("deleteDialog.cancel")}
      />
    </div>
  );
}
