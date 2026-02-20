"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/src/shared/utils/formatCurrency";
import { Bookmark, Mail, MapPin, Phone, StarIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useLocalsSearchStore } from "../store/locals";
import { Separator } from "@/components/ui/separator";

export const ResultDetailSection = () => {
  const { selectedLocal, clearSelectedLocal } = useLocalsSearchStore();
  const t = useTranslations("Locals.search");


  const handleCloseDetail = () => {
    clearSelectedLocal();
  }

  const handleToggleFavorite = () => {
    console.log("toggle favorite");
  }

  if (!selectedLocal) {
    return (
      <section className="w-full lg:w-3/5 pr-4 overflow-y-auto h-[calc(100vh-15rem)]">
        <div className="h-full border-dotted border-2 border-gray-200 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">{t("noSelectedResult")}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <Card className="w-full lg:w-3/5 pt-0 h-fit gap-0 overflow-hidden">
      <div className="relative w-full h-56">
        <Image
          src={selectedLocal.image}
          alt={selectedLocal.name}
          className="object-cover"
          fill
        />
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleToggleFavorite} className="cursor-pointer">
                <Bookmark className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("resultDetail.toggleFavorite")}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleCloseDetail} className="cursor-pointer">
                <X className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("resultDetail.closeDetail")}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <CardHeader className="pt-4">
        <div className="flex gap-2">
          <Avatar size="lg">
            <AvatarImage
              src={selectedLocal.seller.avatar}
              alt={selectedLocal.seller.name}
            />
            <AvatarFallback>
              {selectedLocal.seller.name.charAt(0).toUpperCase()}{selectedLocal.seller.name.charAt(1).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <p className="text-xs text-gray-500">{t("resultDetail.publisher")}</p>
            <p className="text-xl font-bold text-gray-900">{selectedLocal.seller.name}</p>

            <div className="flex items-center gap-2 text-gray-600 font-normal mt-2">
              <div className="flex items-center gap-1">
                <MapPin className="size-4" />
                <p className="text-sm">{selectedLocal.location}</p>
              </div>
              <div className="flex items-center gap-2">
                <StarIcon className="size-5 text-yellow-500" />
                <p className="text-sm">
                  {selectedLocal.rating} {t("resultDetail.reviewsText", { count: selectedLocal.reviews })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <Separator className="my-4" />
        <div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            {selectedLocal.name}
          </CardTitle>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(selectedLocal.price)}
          </div>
        </div>
        <CardDescription className="text-gray-500 text-md font-medium">
          {selectedLocal.description}
        </CardDescription>
        {
          selectedLocal.variants.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900">
                {t("resultDetail.variantsTitle")}
              </h3>
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>{t("resultDetail.variantsTable.name")}</TableHead>
                    <TableHead>{t("resultDetail.variantsTable.price")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {
                    selectedLocal.variants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell className="text-gray-600 font-medium">
                          {variant.name}
                        </TableCell>
                        <TableCell className="text-primary font-bold">
                          {formatCurrency(variant.price)}
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </div>
          )
        }
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900">
            {t("resultDetail.contact")}
          </h3>
          <ul className="flex gap-x-2">
            <li>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Phone className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("resultDetail.contactPhone")}</p>
                </TooltipContent>
              </Tooltip>
            </li>
            <li>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Mail className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("resultDetail.contactEmail")}</p>
                </TooltipContent>
              </Tooltip>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}