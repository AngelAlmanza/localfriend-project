"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const t = useTranslations("Error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      className="min-h-screen bg-background flex items-center justify-center px-6 py-16"
      aria-labelledby="error-heading"
    >
      <div className="max-w-sm w-full text-center">
        {/*
          Warning triangle illustration — "signal lost in the neighborhood"
          Uses text-amber-500 (brand amber) to signal an alert state without
          the harshness of red/destructive.
        */}
        <div className="mx-auto mb-8 w-28 h-28 text-amber-500" aria-hidden="true">
          <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Outer broken orbit */}
            <circle
              cx="60"
              cy="60"
              r="52"
              stroke="currentColor"
              strokeOpacity="0.12"
              strokeWidth="1.5"
              strokeDasharray="6 3"
            />
            {/* Warning triangle */}
            <path
              d="M60 18L104 96H16L60 18Z"
              fill="currentColor"
              fillOpacity="0.1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Crack — something broke */}
            <path
              d="M50 72L56 58L60 65"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeOpacity="0.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Exclamation bar */}
            <rect x="56.5" y="38" width="7" height="24" rx="3.5" fill="currentColor" fillOpacity="0.8" />
            {/* Exclamation dot */}
            <circle cx="60" cy="75" r="4" fill="currentColor" fillOpacity="0.8" />
            {/* Debris particles */}
            <circle cx="28" cy="100" r="2" fill="currentColor" fillOpacity="0.2" />
            <circle cx="93" cy="104" r="2.5" fill="currentColor" fillOpacity="0.2" />
            <circle cx="108" cy="48" r="2" fill="currentColor" fillOpacity="0.15" />
            <circle cx="18" cy="52" r="1.5" fill="currentColor" fillOpacity="0.15" />
          </svg>
        </div>

        {/* Status label */}
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground mb-3">
          {t("code")}
        </p>

        {/* Heading */}
        <h1
          id="error-heading"
          className="text-3xl font-bold text-foreground mb-4 leading-tight"
        >
          {t("title")}
        </h1>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed mb-8">
          {t("description")}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={reset}>
            <RotateCcw className="size-4" aria-hidden="true" />
            {t("retry")}
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home className="size-4" aria-hidden="true" />
              {t("backHome")}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
