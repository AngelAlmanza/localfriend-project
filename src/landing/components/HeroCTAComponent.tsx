"use client"

import { Button } from "@/components/ui/button";
import { MapPin, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function HeroCTAComponent() {
  const router = useRouter();

  const t = useTranslations("Hero.cta");

  const handleSignupAsWorker = () => {
    router.push("/auth/register?registerAs=worker");
  };

  const handleSignupAsLocal = () => {
    router.push("/auth/register?registerAs=local");
  };

  return (
    <div className="fade-in-up-delay-2 flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Button
        variant="secondary"
        onClick={handleSignupAsWorker}
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
