"use client"

import { Local } from "../interfaces/Local";

interface ResultCardProps {
  local: Local;
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/src/shared/utils/formatCurrency";
import { StarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useLocalsSearchStore } from "../store/locals";

export const ResultCard = ({ local }: ResultCardProps) => {
  const t = useTranslations("Locals.search");
  const { setSelectedLocal } = useLocalsSearchStore();

  const handleSelectLocal = () => {
    setSelectedLocal(local);
  }

  return (
    <Card
      className="pt-0 gap-2 cursor-pointer hover:shadow-xl hover:border-text transition-all duration-300 overflow-hidden"
      onClick={handleSelectLocal}
    >
      <div className="relative w-full h-56">
        <Image
          src={local.image}
          alt={local.name}
          className="object-cover"
          fill
        />
      </div>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage
              src={local.seller.avatar}
              alt={local.seller.name}
            />
            <AvatarFallback>
              {local.seller.name.charAt(0).toUpperCase()}{local.seller.name.charAt(1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-gray-500">{t("by")}</p>
            <p className="text-lg font-semibold text-gray-900 -mt-1">{local.seller.name}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <CardTitle className="text-xl font-bold text-gray-900">{local.name}</CardTitle>
        <CardDescription className="text-gray-500 text-sm">
          {local.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2 relative">
          <StarIcon className="size-5 text-yellow-500" />
          <p className="text-lg font-semibold">{local.rating}</p>
          <span className="text-sm text-gray-500 absolute -right-8 top-0">({local.reviews})</span>
        </div>
        <div>
          <p className="text-xl font-bold text-primary">{formatCurrency(local.price)}</p>
        </div>
      </CardFooter>
    </Card>
  )
}