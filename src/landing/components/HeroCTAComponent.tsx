"use client"

import { Button } from "@/components/ui/button";
import { useUserContext } from "@/src/shared/providers/UserProvider";
import { MapPin, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function HeroCTAComponent() {
  const router = useRouter();
  const { user } = useUserContext();

  const t = useTranslations("Landing.Hero.cta");

  const handleSignupAsWorker = () => {
    if (user) {
      router.push("/workers");
    } else {
      router.push("/auth/register?registerAs=worker");
    }
  };

  const handleSignupAsLocal = () => {
    if (user) {
      router.push("/locals/search");
    } else {
      router.push("/auth/register?registerAs=local");
    }
  };

  return (
    <div className="fade-in-up-delay-2 flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Button
        variant="secondary"
        onClick={handleSignupAsWorker}
        className="hover:-translate-y-1 transition-all duration-300 px-8 h-auto py-4 text-lg rounded-lg font-semibold"
        data-testid="hero-worker-cta"
      >
        <Store className="size-6" />
        {t("merchant")}
      </Button>

      <Button
        variant="primary"
        onClick={handleSignupAsLocal}
        className="hover:-translate-y-1 transition-all duration-300 px-8 h-auto py-4 text-lg rounded-lg font-semibold"
        data-testid="hero-local-cta"
      >
        <MapPin className="size-6" />
        {t("local")}
      </Button>
    </div>
  );
}
