import React from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import nextI18NextConfig from "../../next-i18next.config";
import Layout from "@/components/Layout";
import PropertyHero from "@/components/PropertyHero";
import PropertyMap from "@/components/PropertyMap";
import PropertyTour from "@/components/PropertyTour";
import MortgageCalculator from "@/components/MortgageCalculator";
import ContactForm from "@/components/ContactForm";
import ShareButton from "@/components/ShareButton";
import { localizeProperty, Property } from "@/data/properties";
import { useSiteConfig } from "@/contexts/SiteDataContext";
import { getEffectiveProperties, getEffectiveSiteConfig } from "@/utils/storage";
import { jsonSafe } from "@/utils/pageData";

interface PropertyDetailPageProps {
  property: Property;
  __siteData: {
    siteConfig: import("@/config/siteConfig").SiteConfig;
    properties: Property[];
  };
}

export default function PropertyDetailPage({ property }: PropertyDetailPageProps) {
  const { t } = useTranslation("common");
  const { locale } = useRouter();
  const siteConfig = useSiteConfig();
  const whatsappMessage = encodeURIComponent(
    t("propertyDetail.propertyMessage", { title: property.title })
  );
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}?text=${whatsappMessage}`;

  const baseUrl = siteConfig.siteUrl.replace(/\/$/, "");
  const canonicalPath = `/properties/${property.slug}`;
  const absoluteImages = property.images.map((img) =>
    /^https?:\/\//i.test(img) ? img : `${baseUrl}${img.startsWith("/") ? img : `/${img}`}`
  );

  // Schema.org: RealEstateListing is the most specific type recognized by Google
  // for real-estate listings; it improves rich results and intent matching.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: `${baseUrl}${canonicalPath}`,
    image: absoluteImages,
    datePosted: new Date().toISOString().split("T")[0],
    address: {
      "@type": "PostalAddress",
      streetAddress: property.location,
      addressLocality: property.city,
      addressCountry: "MX",
    },
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: property.currency,
      availability: "https://schema.org/InStock",
      businessFunction:
        property.type === "venta"
          ? "https://schema.org/Sell"
          : "https://schema.org/LeaseOut",
    },
    numberOfBedrooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.area,
      unitCode: "MTK",
    },
    broker: {
      "@type": "RealEstateAgent",
      name: siteConfig.brokerName,
      telephone: siteConfig.phone,
      email: siteConfig.email,
    },
  };

  const metaDescription =
    property.description.length > 160
      ? `${property.description.substring(0, 157)}...`
      : property.description;

  return (
    <Layout
      title={property.title}
      description={metaDescription}
      image={property.images[0]}
      canonicalPath={canonicalPath}
      jsonLd={jsonLd}
    >
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-primary">
                {t("propertyDetail.breadcrumbHome")}
              </Link>
              <span>/</span>
              <Link href="/properties" className="hover:text-primary">
                {t("propertyDetail.breadcrumbProperties")}
              </Link>
              <span>/</span>
              <span className="text-gray-900">{property.title}</span>
            </div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main column - Property information */}
            <div className="lg:col-span-2">
              <PropertyHero property={property} />

              {/* Full description */}
              <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t("propertyDetail.description")}
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Spec sheet */}
              <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t("propertyDetail.specs")}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t("propertyDetail.type")}</p>
                    <p className="font-semibold text-gray-900">
                      {property.type === "venta"
                        ? t("propertyCard.forSale")
                        : t("propertyCard.forRent")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t("propertyDetail.bedrooms")}</p>
                    <p className="font-semibold text-gray-900">
                      {property.bedrooms}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t("propertyDetail.bathrooms")}</p>
                    <p className="font-semibold text-gray-900">
                      {property.bathrooms}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {t("propertyDetail.parking")}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {property.parking}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t("propertyDetail.area")}</p>
                    <p className="font-semibold text-gray-900">
                      {property.area} m²
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t("propertyDetail.location")}</p>
                    <p className="font-semibold text-gray-900">
                      {property.location}, {property.city}
                    </p>
                  </div>
                </div>
              </div>

              {/* Virtual tour (if the property has one) */}
              {property.tourUrl && <PropertyTour url={property.tourUrl} />}

              {/* Map with location */}
              <PropertyMap property={property} />

              {/* Mortgage calculator (only for properties for sale) */}
              {property.type === "venta" && (
                <MortgageCalculator property={property} />
              )}

              {/* Share this property */}
              <ShareButton
                title={property.title}
                path={canonicalPath}
                locale={locale}
              />

              {/* Download PDF */}
              <div className="bg-white rounded-lg shadow-md p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-900">{t("propertyDetail.pdfTitle")}</h3>
                  <p className="text-sm text-gray-600">
                    {t("propertyDetail.pdfSubtitle")}
                  </p>
                </div>
                <a
                  href={`/api/properties/${property.slug}/pdf?lang=${locale ?? "es"}`}
                  download={`${property.slug}.pdf`}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t("propertyDetail.downloadPdf")}
                </a>
              </div>

              {/* Highlighted WhatsApp button */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t("propertyDetail.questionsHeading")}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t("propertyDetail.questionsSubtitle")}
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
                >
                  {t("propertyDetail.contactWhatsapp")}
                </a>
              </div>
            </div>

            {/* Side column - Contact form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <ContactForm
                  propertyId={property.id}
                  propertyTitle={property.title}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Only pre-render the properties baked into the template; anything the
  // client adds later renders on-demand via fallback:"blocking".
  const list = await getEffectiveProperties();
  return {
    paths: list.map((p) => ({ params: { slug: p.slug } })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<PropertyDetailPageProps> = async ({
  params,
  locale,
}) => {
  const slug = params?.slug;
  if (typeof slug !== "string") {
    return { notFound: true };
  }

  const [effectiveSite, effectiveProperties] = await Promise.all([
    getEffectiveSiteConfig(),
    getEffectiveProperties(),
  ]);

  const property = effectiveProperties.find((p) => p.slug === slug);
  if (!property) {
    return { notFound: true };
  }

  return {
    props: {
      property: jsonSafe(localizeProperty(property, locale)),
      __siteData: jsonSafe({ siteConfig: effectiveSite, properties: effectiveProperties }),
      ...(await serverSideTranslations(locale ?? "es", ["common"], nextI18NextConfig)),
    },
    revalidate: 30,
  };
};
