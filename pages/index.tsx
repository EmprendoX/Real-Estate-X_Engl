import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import Layout from "@/components/Layout";
import PropertyGrid from "@/components/PropertyGrid";
import TestimonialsSection from "@/components/TestimonialsSection";
import { useSiteConfig, useProperties } from "@/contexts/SiteDataContext";
import { localizeProperties, PropertyType } from "@/data/properties";
import { getTestimonials } from "@/data/testimonials";
import { getAboutContent, renderTemplate } from "@/data/aboutPage";
import type { GetStaticProps } from "next";
import { getBaseStaticProps } from "@/utils/pageData";

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return getBaseStaticProps(locale);
};

export default function Home() {
  const { t } = useTranslation("common");
  const { locale } = useRouter();
  const siteConfig = useSiteConfig();
  const properties = useProperties();
  const [selectedType, setSelectedType] = useState<PropertyType | "all">("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");

  // Properties and content in the active language (with Spanish fallback).
  const localizedProperties = useMemo(
    () => localizeProperties(properties, locale),
    [locale, properties]
  );
  const [filteredProperties, setFilteredProperties] = useState(localizedProperties);

  const featuredProperties = useMemo(
    () => localizeProperties(properties.filter((p) => p.featured === true), locale),
    [locale, properties]
  );
  const cities = useMemo(
    () => Array.from(new Set(properties.map((p) => p.city))),
    [properties]
  );
  const testimonials = useMemo(
    () => getTestimonials(undefined, locale),
    [locale]
  );
  const aboutContent = getAboutContent(locale);
  const tplVars = { city: siteConfig.city, brokerName: siteConfig.brokerName };
  const whatsappMessage = encodeURIComponent(t("whatsapp.defaultMessage"));
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}?text=${whatsappMessage}`;

  // Filter properties when the filters or language change
  useEffect(() => {
    let filtered = localizedProperties;

    if (selectedType !== "all") {
      filtered = filtered.filter((p) => p.type === selectedType);
    }

    if (selectedCity !== "all") {
      filtered = filtered.filter((p) => p.city === selectedCity);
    }

    setFilteredProperties(filtered);
  }, [selectedType, selectedCity, localizedProperties]);

  return (
    <Layout
      title={t("home.metaTitle")}
      description={t("home.metaDescription", {
        city: siteConfig.city,
        slogan: siteConfig.slogan,
      })}
      canonicalPath="/"
      image={
        siteConfig.heroImage ||
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200"
      }
    >
      {/* Main Hero */}
      <section className="relative h-screen flex items-center justify-center text-white">
        <div className="absolute inset-0 z-0">
          <Image
            src={
              siteConfig.heroImage ||
              "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920"
            }
            alt={t("home.heroAlt")}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {siteConfig.siteName}
          </h1>
          <p className="text-xl md:text-2xl mb-2">{siteConfig.slogan}</p>
          <p className="text-lg md:text-xl mb-8 text-gray-200">
            {t("home.inCity", { city: siteConfig.city })}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/properties"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              {t("home.viewProperties")}
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              {t("home.contactWhatsapp")}
            </a>
          </div>
        </div>
      </section>

      {/* Simple Search */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            {t("home.searchHeading")}
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filter by type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("home.operationType")}
                </label>
                <select
                  value={selectedType}
                  onChange={(e) =>
                    setSelectedType(e.target.value as PropertyType | "all")
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">{t("home.allTypes")}</option>
                  <option value="venta">{t("home.typeSale")}</option>
                  <option value="renta">{t("home.typeRent")}</option>
                </select>
              </div>

              {/* Filter by city */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("home.city")}
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">{t("home.allCities")}</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {filteredProperties.length > 0 && (
              <div className="mt-6 text-center">
                <Link
                  href="/properties"
                  className="inline-block bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {t("home.viewCountProperties", { count: filteredProperties.length })}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
            {t("home.featuredHeading")}
          </h2>
          <p className="text-center text-gray-600 mb-12">
            {t("home.featuredSubtitle")}
          </p>
          {featuredProperties.length > 0 ? (
            <PropertyGrid properties={featuredProperties.slice(0, 3)} />
          ) : (
            <PropertyGrid properties={localizedProperties.slice(0, 3)} />
          )}
          <div className="text-center mt-8">
            <Link
              href="/properties"
              className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              {t("home.viewAllProperties")}
            </Link>
          </div>
        </div>
      </section>

      {/* About me / About us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                {renderTemplate(aboutContent.homeIntro.heading, tplVars)}
              </h2>
              {aboutContent.homeIntro.paragraphs.map((p, i) => (
                <p key={i} className="text-gray-600 mb-4">
                  {renderTemplate(p, tplVars)}
                </p>
              ))}
              <Link
                href="/about"
                className="inline-block bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors mt-2"
              >
                {t("home.learnMore")}
              </Link>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src={aboutContent.brokerPhoto}
                alt={siteConfig.brokerName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection testimonials={testimonials} />

      {/* Final CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("home.ctaHeading")}
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            {t("home.ctaSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              {t("home.contactNow")}
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              {t("home.whatsapp")}
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}

