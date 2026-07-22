import React from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useSiteConfig } from "@/contexts/SiteDataContext";

export default function Footer() {
  const { t } = useTranslation("common");
  const siteConfig = useSiteConfig();
  const currentYear = new Date().getFullYear();
  const whatsappMessage = encodeURIComponent(t("whatsapp.defaultMessage"));
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}?text=${whatsappMessage}`;

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Site info */}
          <div>
            <h3 className="text-xl font-bold mb-4">{siteConfig.siteName}</h3>
            <p className="text-gray-400 mb-4">{siteConfig.slogan}</p>
            <p className="text-gray-400 text-sm">
              {siteConfig.city} • {siteConfig.address}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/properties"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("nav.properties")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact and social media */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t("footer.contact")}</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="hover:text-white transition-colors"
                >
                  📞 {siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-white transition-colors"
                >
                  ✉️ {siteConfig.email}
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  💬 WhatsApp
                </a>
              </li>
            </ul>

            {/* Social media */}
            {(siteConfig.facebook ||
              siteConfig.instagram ||
              siteConfig.tiktok ||
              siteConfig.linkedin) && (
              <div className="mt-6">
                <h5 className="text-sm font-semibold mb-2">{t("footer.followUs")}</h5>
                <div className="flex space-x-4">
                  {siteConfig.facebook && (
                    <a
                      href={siteConfig.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label="Facebook"
                    >
                      Facebook
                    </a>
                  )}
                  {siteConfig.instagram && (
                    <a
                      href={siteConfig.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label="Instagram"
                    >
                      Instagram
                    </a>
                  )}
                  {siteConfig.tiktok && (
                    <a
                      href={siteConfig.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label="TikTok"
                    >
                      TikTok
                    </a>
                  )}
                  {siteConfig.linkedin && (
                    <a
                      href={siteConfig.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label="LinkedIn"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>
            {t("footer.copyright", {
              year: currentYear,
              site: siteConfig.siteName,
            })}
          </p>
          <p className="mt-2">
            {t("footer.developedBy", { name: siteConfig.brokerName })}
          </p>
        </div>
      </div>
    </footer>
  );
}


