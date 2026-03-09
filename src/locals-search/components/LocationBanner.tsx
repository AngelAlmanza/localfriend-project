"use client"

import { Button } from "@/components/ui/button"
import { LoadingIcon } from "@/src/shared/components/LoadingIcon"
import { MapPin, MapPinOff } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"

interface LocationBannerProps {
  isDenied: boolean
  isRequesting: boolean
  onRequestLocation: () => void
}

export const LocationBanner = ({ isDenied, isRequesting, onRequestLocation }: LocationBannerProps) => {
  const t = useTranslations("Locals.search.locationBanner")

  if (isDenied) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3" data-testid="location-banner-denied">
        <MapPinOff className="size-5 text-red-600 shrink-0" />
        <p className="text-sm text-red-800 flex-1">
          {t("denied")}
        </p>
        <Button variant="outline" size="sm" asChild className="shrink-0 border-red-300 text-red-700 hover:bg-red-100">
          <Link href="/locals/profile">
            {t("configure")}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3" data-testid="location-banner">
      <MapPin className="size-5 text-amber-600 shrink-0" />
      <p className="text-sm text-amber-800 flex-1">
        {t("message")}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100"
        onClick={onRequestLocation}
        disabled={isRequesting}
      >
        {isRequesting ? <LoadingIcon /> : t("grant")}
      </Button>
    </div>
  )
}
