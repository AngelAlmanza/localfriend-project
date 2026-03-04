import {
  Store,
  Search,
  Star,
  TrendingUp,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimateOnView } from "../../shared/components/AnimateOnView";

const merchantIcons: LucideIcon[] = [TrendingUp, Users, Star];
const localIcons: LucideIcon[] = [Search, Shield, Users];

export function ForWhoSection() {
  const t = useTranslations("Landing.ForWho");
  const merchantBenefits = t.raw("merchant.benefits") as Array<{
    title: string;
    description: string;
  }>;
  const localBenefits = t.raw("local.benefits") as Array<{
    title: string;
    description: string;
  }>;

  return (
    <section
      className="py-20 px-6 bg-linear-to-b from-gray-50 to-white"
      aria-labelledby="for-who-title"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            id="for-who-title"
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            {t("title")}
          </h2>
          <p className="text-xl text-gray-600">{t("subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Merchant Card */}
          <AnimateOnView animation="slide-in-from-left">
            <Card className="rounded-3xl p-10 shadow-xl border-2 border-green-100 hover:border-green-300 hover-lift gap-0">
              <CardContent className="p-0">
                <div className="bg-green-700 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 hover-scale">
                  <Store className="text-white size-8" aria-hidden="true" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {t("merchant.title")}
                </h3>
                <p className="text-gray-600 mb-8">
                  {t("merchant.description")}
                </p>

                <ul className="space-y-4 mb-8">
                  {merchantBenefits.map((benefit, index) => {
                    const Icon = merchantIcons[index];
                    return (
                      <li key={index} className="flex items-start gap-3 group">
                        <div className="bg-green-100 rounded-full p-1 mt-1 group-hover:bg-green-200 transition-colors duration-300">
                          <Icon
                            className="text-green-700 size-4"
                            aria-hidden="true"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {benefit.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {benefit.description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <Button
                  variant="secondary"
                  className="w-full h-auto px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
                  {t("merchant.cta")}
                </Button>
              </CardContent>
            </Card>
          </AnimateOnView>

          {/* Local Card */}
          <AnimateOnView animation="slide-in-from-right">
            <Card className="rounded-3xl p-10 shadow-xl border-2 border-amber-100 hover:border-amber-300 hover-lift gap-0">
              <CardContent className="p-0">
                <div className="bg-amber-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 hover-scale">
                  <Search className="text-white size-8" aria-hidden="true" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {t("local.title")}
                </h3>
                <p className="text-gray-600 mb-8">
                  {t("local.description")}
                </p>

                <ul className="space-y-4 mb-8">
                  {localBenefits.map((benefit, index) => {
                    const Icon = localIcons[index];
                    return (
                      <li key={index} className="flex items-start gap-3 group">
                        <div className="bg-amber-100 rounded-full p-1 mt-1 group-hover:bg-amber-200 transition-colors duration-300">
                          <Icon
                            className="text-amber-600 size-4"
                            aria-hidden="true"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {benefit.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {benefit.description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <Button variant="primary" className="w-full h-auto px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
                  {t("local.cta")}
                </Button>
              </CardContent>
            </Card>
          </AnimateOnView>
        </div>
      </div>
    </section>
  );
}
