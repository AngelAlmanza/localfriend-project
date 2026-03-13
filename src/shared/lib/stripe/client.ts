import Stripe from "stripe"
import { Environment } from "@/src/shared/constants/Environment"

export const stripe = new Stripe(Environment.STRIPE_SECRET_KEY)
