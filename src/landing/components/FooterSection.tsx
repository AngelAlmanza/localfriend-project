import {
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";
import { useTranslations } from "next-intl";

export function FooterSection() {
  const t = useTranslations("Landing.Footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-gray-900 text-gray-300 pt-16 pb-8 px-6"
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-700 p-2 rounded-lg" aria-hidden="true">
                <MapPin className="text-white size-6" />
              </div>
              <span className="text-white font-bold text-xl">
                {t("brandName")}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t("brandDescription")}
            </p>
          </div>

          {/* About */}
          <nav aria-label={t("about.title")}>
            <h4 className="text-white font-bold mb-4">{t("about.title")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-green-400 transition-colors"
                >
                  {t("about.story")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-green-400 transition-colors"
                >
                  {t("about.team")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-green-400 transition-colors"
                >
                  {t("about.mission")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-green-400 transition-colors"
                >
                  {t("about.careers")}
                </a>
              </li>
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label={t("legal.title")}>
            <h4 className="text-white font-bold mb-4">{t("legal.title")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-green-400 transition-colors"
                >
                  {t("legal.terms")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-green-400 transition-colors"
                >
                  {t("legal.privacy")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-green-400 transition-colors"
                >
                  {t("legal.cookies")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-green-400 transition-colors"
                >
                  {t("legal.notice")}
                </a>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4">{t("contact.title")}</h4>
            <ul className="space-y-3 text-sm mb-6">
              <li className="flex items-center gap-2">
                <Mail className="text-green-400 size-4" aria-hidden="true" />
                <a
                  href={`mailto:${t("contact.email")}`}
                  className="hover:text-green-400 transition-colors"
                >
                  {t("contact.email")}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin
                  className="text-green-400 size-4"
                  aria-hidden="true"
                />
                <span>{t("contact.location")}</span>
              </li>
            </ul>

            <div>
              <h5 className="text-white font-semibold mb-3 text-sm">
                {t("contact.social")}
              </h5>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="bg-gray-800 p-2 rounded-lg hover:bg-green-700 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="size-5" />
                </a>
                <a
                  href="#"
                  className="bg-gray-800 p-2 rounded-lg hover:bg-green-700 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="size-5" />
                </a>
                <a
                  href="#"
                  className="bg-gray-800 p-2 rounded-lg hover:bg-green-700 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="size-5" />
                </a>
                <a
                  href="#"
                  className="bg-gray-800 p-2 rounded-lg hover:bg-green-700 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="size-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>{t("copyright", { year: currentYear })}</p>
        </div>
      </div>
    </footer>
  );
}
