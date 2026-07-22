import React from "react";
import type { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";
import Layout from "@/components/Layout";
import ContactForm from "@/components/ContactForm";
import { useSiteConfig } from "@/contexts/SiteDataContext";
import { getBaseStaticProps } from "@/utils/pageData";

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return getBaseStaticProps(locale);
};

export default function ContactPage() {
  const { t } = useTranslation("common");
  const siteConfig = useSiteConfig();
  const whatsappMessage = encodeURIComponent(t("contact.message"));
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}?text=${whatsappMessage}`;

  return (
    <Layout
      title={t("contact.metaTitle")}
      description={t("contact.metaDescription", {
        name: siteConfig.brokerName,
        city: siteConfig.city,
      })}
      canonicalPath="/contact"
    >
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t("contact.heading")}
            </h1>
            <p className="text-lg text-gray-600">
              {t("contact.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left column - Form */}
            <div>
              <ContactForm />
            </div>

            {/* Right column - Contact information */}
            <div className="space-y-6">
              {/* Highlighted contact information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t("contact.contactInfo")}
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">📞</div>
                    <div>
                      <p className="font-semibold text-gray-900">{t("contact.phone")}</p>
                      <a
                        href={`tel:${siteConfig.phone}`}
                        className="text-primary hover:underline"
                      >
                        {siteConfig.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">✉️</div>
                    <div>
                      <p className="font-semibold text-gray-900">{t("contact.email")}</p>
                      <a
                        href={`mailto:${siteConfig.email}`}
                        className="text-primary hover:underline"
                      >
                        {siteConfig.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">💬</div>
                    <div>
                      <p className="font-semibold text-gray-900">{t("contact.whatsapp")}</p>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {t("contact.sendMessage")}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">📍</div>
                    <div>
                      <p className="font-semibold text-gray-900">{t("contact.location")}</p>
                      <p className="text-gray-700">{siteConfig.address}</p>
                      <p className="text-gray-700">{siteConfig.city}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business hours */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t("contact.hoursTitle")}
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>{t("contact.weekdays")}</strong> {t("contact.weekdaysHours")}
                  </p>
                  <p>
                    <strong>{t("contact.saturday")}</strong> {t("contact.saturdayHours")}
                  </p>
                  <p>
                    <strong>{t("contact.sunday")}</strong> {t("contact.sundayHours")}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  {t("contact.hoursNote")}
                </p>
              </div>

              {/* Highlighted WhatsApp button */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t("contact.preferWhatsapp")}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t("contact.preferWhatsappSubtitle")}
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  {t("contact.openWhatsapp")}
                </a>
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="mt-12 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-96 bg-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-lg font-semibold mb-2">{t("contact.map")}</p>
                <p className="text-sm">
                  {siteConfig.address}, {siteConfig.city}
                </p>
                <p className="text-xs mt-2">
                  {t("contact.mapNote")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


