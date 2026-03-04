import { Button } from "@/components/ui/button";
import { MapPin, Store } from "lucide-react";
import { useTranslations } from "next-intl";

export function FinalCTASection() {
  const t = useTranslations("Landing.FinalCTA");

  return (
    <section
      className="py-20 px-6 bg-linear-to-b from-gray-50 to-white"
      aria-labelledby="final-cta-title"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2
          id="final-cta-title"
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
        >
          {t("title")}
        </h2>
        <p className="text-xl text-gray-600 mb-10">{t("subtitle")}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            variant="secondary"
            className="h-auto px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Store className="size-6" aria-hidden="true" />
            {t("cta.merchant")}
          </Button>
          <Button
            variant="primary"
            className="h-auto px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <MapPin className="size-6" aria-hidden="true" />
            {t("cta.local")}
          </Button>
        </div>
      </div>
    </section>
  );
}
