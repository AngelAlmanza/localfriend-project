"use client";

import { useTranslations } from "next-intl";
import {
  UserCircle,
  FileText,
  Upload,
  Search,
  Eye,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimateOnView } from "../../shared/components/AnimateOnView";

const merchantIcons: LucideIcon[] = [
  UserCircle,
  FileText,
  Upload,
  MessageCircle,
];
const localIcons: LucideIcon[] = [UserCircle, Search, Eye, MessageCircle];

interface StepCardProps {
  icon: LucideIcon;
  stepNumber: number;
  title: string;
  description: string;
  variant: "merchant" | "local";
  isLast: boolean;
  delay: number;
}

function StepCard({
  icon: Icon,
  stepNumber,
  title,
  description,
  variant,
  isLast,
  delay,
}: StepCardProps) {
  const t = useTranslations("Landing.HowItWorks");
  const isMerchant = variant === "merchant";

  return (
    <div className="relative">
      {/* Connector line between steps */}
      {!isLast && (
        <div
          className={`hidden md:block absolute top-12 left-1/2 w-full h-1 bg-linear-to-r ${
            isMerchant
              ? "from-green-200 to-green-100"
              : "from-amber-200 to-amber-100"
          } -z-10`}
          aria-hidden="true"
        />
      )}

      <AnimateOnView animation="fade-in-scale" delay={delay}>
        <div className="bg-gray-50 rounded-2xl p-6 text-center hover-lift border border-gray-100">
          <div
            className={`${
              isMerchant ? "bg-green-700" : "bg-amber-500"
            } w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg hover-scale`}
          >
            <Icon className="text-white size-7" aria-hidden="true" />
          </div>
          <div
            className={`${
              isMerchant ? "text-green-700" : "text-amber-600"
            } text-sm font-bold mb-2`}
          >
            {t("step", { number: stepNumber })}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </AnimateOnView>
    </div>
  );
}

export function HowItWorksTabs() {
  const t = useTranslations("Landing.HowItWorks");
  const merchantSteps = t.raw("merchantSteps") as Array<{
    title: string;
    description: string;
  }>;
  const localSteps = t.raw("localSteps") as Array<{
    title: string;
    description: string;
  }>;

  return (
    <Tabs defaultValue="merchant" className="items-center">
      <TabsList className="bg-gray-100 rounded-full h-auto w-auto">
        <TabsTrigger
          value="merchant"
          className="cursor-pointer data-[state=active]:cursor-default rounded-full px-8 py-4 font-semibold text-base data-[state=active]:bg-green-700 data-[state=active]:text-white data-[state=active]:shadow-lg"
        >
          {t("tabs.merchant")}
        </TabsTrigger>
        <TabsTrigger
          value="local"
          className="cursor-pointer data-[state=active]:cursor-default rounded-full px-8 py-4 font-semibold text-base data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
        >
          {t("tabs.local")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="merchant">
        <div className="grid md:grid-cols-4 gap-6">
          {merchantSteps.map((step, index) => (
            <StepCard
              key={index}
              icon={merchantIcons[index]}
              stepNumber={index + 1}
              title={step.title}
              description={step.description}
              variant="merchant"
              isLast={index === merchantSteps.length - 1}
              delay={index * 80}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="local">
        <div className="grid md:grid-cols-4 gap-6">
          {localSteps.map((step, index) => (
            <StepCard
              key={index}
              icon={localIcons[index]}
              stepNumber={index + 1}
              title={step.title}
              description={step.description}
              variant="local"
              isLast={index === localSteps.length - 1}
              delay={index * 80}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
