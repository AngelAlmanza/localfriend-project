export interface Price {
  id: string
  planId: string
  stripePriceId: string | null
  amount: number
  currency: string
  label: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Plan {
  id: string
  name: string
  description: string | null
  features: string[]
  stripeProductId: string | null
  billingInterval: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  prices?: Price[]
}

export interface CreatePlanInput {
  name: string
  description?: string
  features: string[]
  billingInterval: string
}

export interface UpdatePlanInput {
  id: string
  name: string
  description?: string
  features: string[]
  billingInterval: string
  isActive: boolean
}

export interface AddPriceInput {
  planId: string
  currency: string
  amount: number
  label?: string
}
