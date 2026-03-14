"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LoadingIcon } from "@/src/shared/components/LoadingIcon"
import { StripeProvider } from "@/src/shared/lib/stripe/stripe-provider"
import type { UserPaymentMethod } from "@/src/subscriptions/interfaces/Subscription"
import { CreditCard, Plus, Star, Trash2, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { CardForm } from "./CardForm"

interface PaymentMethodsSectionProps {
  paymentMethods: UserPaymentMethod[]
}

export const PaymentMethodsSection = ({ paymentMethods }: PaymentMethodsSectionProps) => {
  const t = useTranslations("Subscriptions.paymentMethods")
  const tAdd = useTranslations("Subscriptions.addPaymentMethod")
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/payment-methods", { method: "POST" })
    if (res.ok) {
      const data = await res.json()
      setClientSecret(data.clientSecret)
    } else {
      toast.error(tAdd("error"))
      setIsAddingCard(false)
      setClientSecret(null)
    }
  }, [tAdd])

  useEffect(() => {
    if (isAddingCard && !clientSecret) {
      fetchClientSecret()
    }
  }, [isAddingCard, clientSecret, fetchClientSecret])

  const handleSetDefault = async (id: string) => {
    setLoading(id)
    try {
      const res = await fetch(`/api/payment-methods/${id}`, { method: "PATCH" })
      if (res.ok) {
        toast.success(t("defaultSet"))
        router.refresh()
      } else {
        toast.error(t("error"))
      }
    } catch {
      toast.error(t("error"))
    } finally {
      setLoading(null)
    }
  }

  const handleRemove = async (id: string) => {
    setLoading(id)
    try {
      const res = await fetch(`/api/payment-methods/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success(t("removed"))
        router.refresh()
      } else {
        toast.error(t("error"))
      }
    } catch {
      toast.error(t("error"))
    } finally {
      setLoading(null)
    }
  }

  const handleAddSuccess = () => {
    setIsAddingCard(false)
    setClientSecret(null)
    router.refresh()
  }

  const handleCancelAdd = () => {
    setIsAddingCard(false)
    setClientSecret(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {paymentMethods.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noMethods")}</p>
        ) : (
          paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="size-5 text-muted-foreground" />
                <p className="text-sm font-medium capitalize">
                  {pm.brand} **** {pm.last4}
                </p>
                {pm.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    {t("default")}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!pm.isDefault && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSetDefault(pm.id)}
                    disabled={loading === pm.id}
                    title={t("setDefault")}
                  >
                    <Star className="size-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(pm.id)}
                  disabled={loading === pm.id}
                  title={t("remove")}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}

        <Separator />

        {isAddingCard ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{tAdd("title")}</p>
              <Button variant="ghost" size="icon" onClick={handleCancelAdd}>
                <X className="size-4" />
              </Button>
            </div>
            {clientSecret ? (
              <StripeProvider clientSecret={clientSecret}>
                <CardForm clientSecret={clientSecret} onSuccess={handleAddSuccess} />
              </StripeProvider>
            ) : (
              <div className="flex justify-center py-4">
                <LoadingIcon />
              </div>
            )}
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsAddingCard(true)}
          >
            <Plus className="size-4 mr-2" />
            {tAdd("addCard")}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
