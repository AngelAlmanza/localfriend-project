import { Button } from "@/components/ui/button"
import { LoadingIcon } from "@/src/shared/components/LoadingIcon"
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { useTranslations } from "next-intl"
import { SyntheticEvent, useState } from "react"
import { toast } from "sonner"

interface CardFormProps {
  clientSecret: string
  onSuccess: () => void
}

export const CardForm = ({ clientSecret, onSuccess }: CardFormProps) => {
  const t = useTranslations("Subscriptions.addPaymentMethod")
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsLoading(true)

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) return

      const { error, setupIntent } = await stripe.confirmCardSetup(
        clientSecret,
        { payment_method: { card: cardElement } },
      )

      if (error) {
        toast.error(error.message ?? t("error"))
        return
      }

      if (setupIntent?.payment_method) {
        const pmId = typeof setupIntent.payment_method === "string"
          ? setupIntent.payment_method
          : setupIntent.payment_method.id

        const res = await fetch("/api/payment-methods/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentMethodId: pmId }),
        })

        if (res.ok) {
          toast.success(t("success"))
          onSuccess()
        } else {
          toast.error(t("error"))
        }
      }
    } catch {
      toast.error(t("error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-md border p-3">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#1a1a1a",
                "::placeholder": { color: "#a1a1aa" },
              },
            },
          }}
        />
      </div>
      <Button type="submit" disabled={!stripe || isLoading} className="w-full">
        {t("submit")}
        {isLoading && <LoadingIcon />}
      </Button>
    </form>
  )
}