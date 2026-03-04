import { Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimateOnView } from "../../shared/components/AnimateOnView";

export function AppStoresSection() {
  const t = useTranslations("Landing.AppStores");

  return (
    <section className="py-20 px-6 bg-white" aria-labelledby="app-stores-title">
      <div className="max-w-6xl mx-auto">
        <AnimateOnView animation="fade-in-scale" threshold={0.2}>
          <div className="bg-linear-to-br from-green-700 to-green-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl hover-lift">
            <div className="max-w-3xl mx-auto">
              <div
                className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 hover-scale"
                aria-hidden="true"
              >
                <Smartphone className="size-10" />
              </div>

              <h2
                id="app-stores-title"
                className="text-4xl md:text-5xl font-bold mb-6"
              >
                {t("title")}
              </h2>
              <p className="text-xl text-green-50 mb-10">{t("subtitle")}</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {/* App Store */}
                <a
                  href="#"
                  className="bg-black hover:bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 group"
                  aria-label={`${t("appStore.label")} ${t("appStore.store")}`}
                >
                  <svg
                    className="w-8 h-8 group-hover:scale-110 transition-transform duration-300"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">{t("appStore.label")}</div>
                    <div className="text-lg font-bold">
                      {t("appStore.store")}
                    </div>
                  </div>
                </a>

                {/* Google Play */}
                <a
                  href="#"
                  className="bg-black hover:bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 group"
                  aria-label={`${t("googlePlay.label")} ${t("googlePlay.store")}`}
                >
                  <svg
                    className="w-8 h-8 group-hover:scale-110 transition-transform duration-300"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">{t("googlePlay.label")}</div>
                    <div className="text-lg font-bold">
                      {t("googlePlay.store")}
                    </div>
                  </div>
                </a>
              </div>

              <p className="text-sm text-green-100 mt-6">
                {t("compatibility")}
              </p>
            </div>
          </div>
        </AnimateOnView>
      </div>
    </section>
  );
}
