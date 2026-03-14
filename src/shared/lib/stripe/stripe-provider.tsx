"use client"

import { Environment } from "@/src/shared/constants/Environment"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import type { ReactNode } from "react"

const stripePromise = loadStripe(Environment.STRIPE_PUBLISHABLE_KEY)

interface StripeProviderProps {
  clientSecret: string
  children: ReactNode
}

export function StripeProvider({ clientSecret, children }: StripeProviderProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: "stripe" },
      }}
    >
      {children}
    </Elements>
  )
}
