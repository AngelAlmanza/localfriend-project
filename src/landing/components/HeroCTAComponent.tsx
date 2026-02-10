"use client"

import { Button } from "@/components/ui/button";
import { MapPin, Store } from "lucide-react";
import { useTranslations } from "next-intl";

export function HeroCTAComponent() {
  const t = useTranslations("Hero.cta");

  const handleSignupAsMerchant = () => {
    console.log("signup as merchant");
  };

  const handleSignupAsLocal = () => {
    console.log("signup as local");
  };

  return (
    <div className="fade-in-up-delay-2 flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Button
        variant="secondary"
        onClick={handleSignupAsMerchant}
        className="hover:-translate-y-1 transition-all duration-300 px-8 h-auto py-4 text-lg rounded-lg font-semibold"
      >
        <Store className="size-6" />
        {t("merchant")}
      </Button>

      <Button
        variant="primary"
        onClick={handleSignupAsLocal}
        className="hover:-translate-y-1 transition-all duration-300 px-8 h-auto py-4 text-lg rounded-lg font-semibold"
      >
        <MapPin className="size-6" />
        {t("local")}
      </Button>
    </div>
  );
}
