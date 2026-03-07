"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useTranslations } from "next-intl";

interface ListingTablePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getVisiblePages(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("ellipsis");

  pages.push(total);
  return pages;
}

export function ListingTablePagination({
  page,
  totalPages,
  onPageChange,
}: ListingTablePaginationProps) {
  const t = useTranslations("Shared.pagination");

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <Pagination className="w-fit mx-0">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) onPageChange(page - 1);
            }}
            aria-disabled={page <= 1}
            className={
              page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
            }
            aria-label={t("previous")}
          >
            {t("previous")}
          </PaginationPrevious>
        </PaginationItem>

        {visiblePages.map((p, i) =>
          p === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                isActive={p === page}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(p);
                }}
                aria-label={t("goToPage", { page: p })}
                className="cursor-pointer"
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page < totalPages) onPageChange(page + 1);
            }}
            aria-disabled={page >= totalPages}
            className={
              page >= totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
            aria-label={t("next")}
          >
            {t("next")}
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
