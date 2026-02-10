import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import { HeroCTAComponent } from "./HeroCTAComponent";
import Link from "next/link";

export function HeroSection() {
  const t = useTranslations("Hero");

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 [clip-path:inset(0)]">
      {/* Background image — fixed for parallax effect, clipped by clip-path on section */}
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        <Image
          src="https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="LocalFriend Project Hero Image"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
      </div>

      {/* Dark overlay — also fixed to stay with the image */}
      <div className="fixed inset-0 bg-black/50 -z-10" aria-hidden="true" />

      {/* Content */}
      <div className="relative max-w-4xl mx-auto text-center z-10">
        <h1 className="fade-in-up text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          {t.rich("title", {
            highlight: (chunks) => (
              <span className="text-amber-400">{chunks}</span>
            ),
          })}
        </h1>

        <p className="fade-in-up-delay-1 text-xl md:text-2xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
          {t("subtitle")}
        </p>

        <HeroCTAComponent />
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        aria-hidden="true"
      >
        <ArrowDown className="size-6 text-white" />
      </div>
    </section>
  );
}
