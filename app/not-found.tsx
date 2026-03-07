import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main
      className="min-h-screen bg-background flex items-center justify-center px-6 py-16"
      aria-labelledby="not-found-heading"
    >
      <div className="max-w-sm w-full text-center">
        {/*
          Map pin illustration — "GPS pointing at an empty lot"
          Uses text-primary (brand green) so it adapts to light/dark mode.
        */}
        <div className="mx-auto mb-8 w-28 h-32 text-primary" aria-hidden="true">
          <svg
            viewBox="0 0 120 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Dashed orbit — "searching in circles" */}
            <circle
              cx="60"
              cy="51"
              r="54"
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            {/* Ground shadow */}
            <ellipse
              cx="60"
              cy="132"
              rx="16"
              ry="4"
              fill="currentColor"
              fillOpacity="0.08"
            />
            {/* Pin body */}
            <path
              d="M60 12C38.5 12 21 29.5 21 51C21 72.5 60 128 60 128C60 128 99 72.5 99 51C99 29.5 81.5 12 60 12Z"
              fill="currentColor"
              fillOpacity="0.1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Inner circle — background fill so "?" is legible in dark mode too */}
            <circle
              cx="60"
              cy="51"
              r="18"
              style={{ fill: "var(--background)" }}
              stroke="currentColor"
              strokeWidth="1.5"
            />
            {/* Question mark */}
            <text
              x="60"
              y="57"
              textAnchor="middle"
              fontSize="20"
              fontWeight="700"
              fill="currentColor"
              fontFamily="Inter, system-ui, sans-serif"
            >
              ?
            </text>
            {/* Scattered dots — the path that leads nowhere */}
            <circle
              cx="18"
              cy="28"
              r="2.5"
              fill="currentColor"
              fillOpacity="0.18"
            />
            <circle
              cx="105"
              cy="32"
              r="2"
              fill="currentColor"
              fillOpacity="0.18"
            />
            <circle
              cx="112"
              cy="72"
              r="3"
              fill="currentColor"
              fillOpacity="0.12"
            />
            <circle
              cx="14"
              cy="80"
              r="2"
              fill="currentColor"
              fillOpacity="0.12"
            />
          </svg>
        </div>

        {/* Status code */}
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground mb-3">
          {t("code")}
        </p>

        {/* Heading */}
        <h1
          id="not-found-heading"
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
          <Button asChild size="lg">
            <Link href="/">
              <Home className="size-4" aria-hidden="true" />
              {t("backHome")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/locals/search">
              <Search className="size-4" aria-hidden="true" />
              {t("exploreServices")}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
