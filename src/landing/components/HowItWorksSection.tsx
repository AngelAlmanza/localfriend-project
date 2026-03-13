import { getTranslations } from "next-intl/server";
import { HowItWorksTabs } from "./HowItWorksTabs";

export async function HowItWorksSection() {
  const t = await getTranslations("Landing.HowItWorks");

  return (
    <section
      className="py-20 px-6 bg-white"
      aria-labelledby="how-it-works-title"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2
            id="how-it-works-title"
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            {t("title")}
          </h2>
          <p className="text-xl text-gray-600">{t("subtitle")}</p>
        </div>

        <HowItWorksTabs />
      </div>
    </section>
  );
}
