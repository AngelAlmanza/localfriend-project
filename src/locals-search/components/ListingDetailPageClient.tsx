"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { createClient } from "@/src/shared/lib/supabase/client"
import { useUserContext } from "@/src/shared/providers/UserProvider"
import { formatCurrency } from "@/src/shared/utils/formatCurrency"
import { ArrowLeft, Mail, Package, UserCircle, Wrench } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { SearchListingType, SearchResultDetail } from "../interfaces/Local"
import { RegisterViewService } from "../services/RegisterViewService"
import { SearchService } from "../services/SearchService"
import { FavoriteButton } from "./FavoriteButton"
import { ReviewsSection } from "@/src/reviews/components/ReviewsSection"

interface ListingDetailPageClientProps {
  id: string
  type: SearchListingType
}

export const ListingDetailPageClient = ({ id, type }: ListingDetailPageClientProps) => {
  const t = useTranslations("Locals.search")
  const supabase = useMemo(() => createClient(), [])
  const { user } = useUserContext()
  const [detail, setDetail] = useState<SearchResultDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchDetail = async () => {
      setIsLoading(true)
      const { right, left } = await SearchService.getListingDetail(id, type, supabase)

      if (right) {
        setDetail(right)
        // Register view
        RegisterViewService.registerView(type, id, user.id, supabase)
      } else if (left) {
        setNotFound(true)
      }

      setIsLoading(false)
    }

    fetchDetail()
  }, [id, type, user, supabase])

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-6 w-32" />
        <Card>
          <CardHeader className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (notFound || !detail) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-gray-600">{t("detailPage.notFound")}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/locals/search">
            <ArrowLeft className="size-4 mr-1.5" />
            {t("detailPage.backToSearch")}
          </Link>
        </Button>
      </div>
    )
  }

  const priceDisplay = () => {
    if (detail.minPrice == null) return t("card.noPrice")
    if (detail.minPrice === detail.maxPrice) return formatCurrency(detail.minPrice)
    return `${formatCurrency(detail.minPrice)} - ${formatCurrency(detail.maxPrice!)}`
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link href="/locals/search">
          <ArrowLeft className="size-4 mr-1" />
          {t("detailPage.backToSearch")}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs gap-1">
                {detail.type === "product" ? (
                  <Package className="size-3" />
                ) : (
                  <Wrench className="size-3" />
                )}
                {detail.type === "product" ? t("card.product") : t("card.service")}
              </Badge>
              <span className="text-sm text-gray-400">{detail.categoryName}</span>
            </div>
            <FavoriteButton
              type={detail.type}
              listingId={detail.id}
              isFavorited={detail.isFavorited}
            />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mt-2">
            {detail.name}
          </CardTitle>
          <div className="text-2xl font-bold text-primary">
            {priceDisplay()}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {detail.description && (
            <p className="text-gray-600 leading-relaxed">
              {detail.description}
            </p>
          )}

          <Separator />

          {/* Worker */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">{t("detail.publisher")}</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-12 rounded-full bg-gray-100">
                <UserCircle className="size-7 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{detail.workerName}</p>
              </div>
            </div>
          </div>

          {/* Variants */}
          {detail.variants.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">{t("detail.variantsTitle")}</h3>
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>{t("detail.variantsTable.name")}</TableHead>
                      <TableHead>{t("detail.variantsTable.price")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.variants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell className="text-gray-600 font-medium">{variant.name}</TableCell>
                        <TableCell className="text-primary font-bold">
                          {variant.price != null
                            ? formatCurrency(variant.price)
                            : variant.priceMin != null
                              ? `${formatCurrency(variant.priceMin)}${variant.priceMax ? ` - ${formatCurrency(variant.priceMax)}` : ""}`
                              : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          <Separator />

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">{t("detail.contact")}</h3>
            <div className="flex gap-2">
              {detail.workerEmail && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="gap-1.5" asChild>
                      <a href={`mailto:${detail.workerEmail}`}>
                        <Mail className="size-4" />
                        {t("detail.contactEmail")}
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{detail.workerEmail}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Reviews */}
          <ReviewsSection
            listingId={detail.id}
            listingType={detail.type}
          />
        </CardContent>
      </Card>
    </div>
  )
}
