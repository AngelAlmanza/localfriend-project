import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { getTranslations } from "next-intl/server"

interface ExpiredSubscriptionAlertProps {
  hasPaymentMethod: boolean
}

export const ExpiredSubscriptionAlert = async ({ hasPaymentMethod }: ExpiredSubscriptionAlertProps) => {
  const t = await getTranslations("Subscriptions.expired")

  return (
    <Alert variant="destructive">
      <AlertTriangle className="size-4" />
      <AlertTitle>{t("title")}</AlertTitle>
      <AlertDescription>
        {hasPaymentMethod ? t("withPaymentMethod") : t("withoutPaymentMethod")}
      </AlertDescription>
    </Alert>
  )
}
