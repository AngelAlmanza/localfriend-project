import { Card, CardContent } from "@/components/ui/card";
import { Eye, MapPin, MessageCircle, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AnimateOnView } from "../../shared/components/AnimateOnView";

const featureIcons: LucideIcon[] = [Eye, MapPin, MessageCircle];

export async function WhatIsSection() {
  const t = await getTranslations("Landing.WhatIs");
  const features = t.raw("features") as Array<{
    title: string;
    description: string;
  }>;

  return (
    <section className="py-20 px-6 bg-white" aria-labelledby="what-is-title">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            id="what-is-title"
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            {t("title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = featureIcons[index];
            return (
              <AnimateOnView
                key={index}
                animation="fade-in-scale"
                delay={index * 100}
                className="h-full"
              >
                <Card className="bg-gray-50 rounded-2xl p-8 hover-lift border-gray-100 hover:border-green-200 h-full shadow-none gap-0">
                  <CardContent className="p-0">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 hover-scale">
                      <Icon
                        className="text-green-700 size-8"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </AnimateOnView>
            );
          })}
        </div>
      </div>
    </section>
  );
}
