"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LoadingIcon } from "@/src/shared/components/LoadingIcon"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

interface ReactivateSubscriptionCardProps {
  hasPaymentMethod: boolean
  isCanceling?: boolean
}

export const ReactivateSubscriptionCard = ({
  hasPaymentMethod,
  isCanceling = false,
}: ReactivateSubscriptionCardProps) => {
  const t = useTranslations("Subscriptions.reactivate")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleReactivate = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/subscriptions/reactivate", { method: "POST" })
      if (res.ok) {
        toast.success(isCanceling ? t("successCanceling") : t("success"))
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error ?? t("error"))
      }
    } catch {
      toast.error(t("error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={isCanceling ? "border-orange-200 bg-orange-50" : "border-yellow-200 bg-yellow-50"}>
      <CardHeader>
        <CardTitle className="text-base">
          {isCanceling ? t("titleCanceling") : t("title")}
        </CardTitle>
        <CardDescription>
          {isCanceling ? t("descriptionCanceling") : t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasPaymentMethod || isCanceling ? (
          <Button onClick={handleReactivate} disabled={isLoading} className="w-full">
            {isCanceling ? t("buttonCanceling") : t("button")}
            {isLoading && <LoadingIcon />}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">{t("needPaymentMethod")}</p>
        )}
      </CardContent>
    </Card>
  )
}
