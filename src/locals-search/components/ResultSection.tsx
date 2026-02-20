import { useTranslations } from "next-intl";
import { Local } from "../interfaces/Local";
import { ResultCard } from "./ResultCard"

interface ResultSectionProps {
  localResults: Local[];
}

export const ResultSection = ({ localResults }: ResultSectionProps) => {
  const t = useTranslations("Locals.search");

  return (
    <section className="w-full lg:w-2/5 pr-4 pb-4 overflow-y-auto max-h-[calc(100vh-13rem)]">
      <h2 className="text-2xl font-bold mb-4">
        {t("results", { count: localResults.length })}
      </h2>
      <ul className="flex flex-col gap-4">
        {localResults.map((local) => (
          <li key={local.id}>
            <ResultCard local={local} />
          </li>
        ))}
      </ul>
    </section>
  )
}