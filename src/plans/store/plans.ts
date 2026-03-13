import { create } from "zustand"
import { Plan } from "../interfaces/Plan"

export interface PlansState {
  plans: Plan[]
  selectedPlan: Plan | null
  setPlans: (plans: Plan[]) => void
  updatePlan: (plan: Plan) => void
  setSelectedPlan: (plan: Plan | null) => void
}

export const usePlansStore = create<PlansState>((set) => ({
  plans: [],
  selectedPlan: null,
  setPlans: (plans) => set({ plans }),
  updatePlan: (plan) =>
    set((state) => ({
      plans: state.plans.map((p) => (p.id === plan.id ? plan : p)),
    })),
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
}))