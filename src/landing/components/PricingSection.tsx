import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/src/shared/utils/formatCurrency";
import { Check, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AnimateOnView } from "../../shared/components/AnimateOnView";
import { fetchActivePlans } from "../lib/fetchActivePlans";

export async function PricingSection() {
  const t = await getTranslations("Landing.Pricing");
  const benefits = t.raw("benefits") as string[];

  const plans = await fetchActivePlans();
  const plan = plans[0] ?? null;
  const price = plan?.prices?.[0] ?? null;

  const featuresList =
    plan?.features && plan.features.length > 0 ? plan.features : benefits;

  return (
    <section
      className="py-20 px-6 bg-linear-to-b from-gray-50 to-white"
      aria-labelledby="pricing-title"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            id="pricing-title"
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            {t("title")}
          </h2>
          <p className="text-xl text-gray-600">{t("subtitle")}</p>
        </div>

        <div className="max-w-lg mx-auto">
          <AnimateOnView animation="fade-in-scale" threshold={0.2}>
            <Card className="rounded-3xl shadow-2xl border-2 border-green-200 overflow-hidden relative hover-lift p-0 gap-0">
              {/* Promo badge */}
              <div className="absolute top-6 right-6 z-10 animate-pulse">
                <Badge className="bg-linear-to-r from-amber-400 to-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg border-0">
                  <Sparkles className="size-4" aria-hidden="true" />
                  {t("badge")}
                </Badge>
              </div>

              {/* Plan header */}
              <div className="bg-linear-to-br from-green-700 to-green-600 p-10 pt-16 text-white">
                <h3 className="text-3xl font-bold mb-2">
                  {plan?.name ?? t("planName")}
                </h3>
                <p className="text-green-100 mb-6">
                  {plan?.description ?? t("planDescription")}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold">
                    {formatCurrency(price?.amount ?? 0, price?.currency ?? "USD")}
                  </span>
                  <span className="text-2xl text-green-100">{t("period")}</span>
                </div>
                <p className="text-sm text-green-100 mt-2">{t("trialNote")}</p>
              </div>

              {/* Benefits list */}
              <CardContent className="p-10">
                <h4 className="font-bold text-gray-900 text-lg mb-6">
                  {t("benefitsTitle")}
                </h4>
                <ul className="space-y-4 mb-8">
                  {featuresList.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 group">
                      <div className="bg-green-100 rounded-full p-1 mt-0.5 group-hover:bg-green-200 transition-colors duration-300">
                        <Check
                          className="text-green-700 size-4"
                          aria-hidden="true"
                        />
                      </div>
                      <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant="primary"
                  className="w-full h-auto px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  {t("cta")}
                </Button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  {t("disclaimer")}
                </p>
              </CardContent>
            </Card>
          </AnimateOnView>
        </div>
      </div>
    </section>
  );
}
