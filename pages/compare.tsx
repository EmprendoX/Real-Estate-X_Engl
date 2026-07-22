import React, { useMemo } from "react";
import { GetStaticProps } from "next";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import Layout from "@/components/Layout";
import { localizeProperties, Property } from "@/data/properties";
import { formatPrice } from "@/utils/formatPrice";
import { useSiteConfig, useProperties } from "@/contexts/SiteDataContext";
import { getBaseStaticProps } from "@/utils/pageData";

const MAX_COMPARE = 3;

interface Row {
  label: string;
  /** Function that takes a property and returns the value to display. */
  value: (p: Property) => React.ReactNode;
  /** When all cells are equal, we dim the row to highlight differences. */
  highlight?: boolean;
}

export default function ComparePage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { locale } = router;
  const siteConfig = useSiteConfig();
  const properties = useProperties();
  const allProps = useMemo(
    () => localizeProperties(properties, locale),
    [properties, locale]
  );

  const ROWS: Row[] = [
    {
      label: t("compare.rowPrice"),
      value: (p) => (
        <span className="text-xl font-bold text-primary">
          {formatPrice(p.price, p.currency)}
        </span>
      ),
    },
    { label: t("compare.rowType"), value: (p) => (p.type === "venta" ? t("compare.typeSale") : t("compare.typeRent")) },
    { label: t("compare.rowLocation"), value: (p) => `${p.location}, ${p.city}` },
    { label: t("compare.rowBedrooms"), value: (p) => p.bedrooms },
    { label: t("compare.rowBathrooms"), value: (p) => p.bathrooms },
    { label: t("compare.rowParking"), value: (p) => p.parking },
    { label: t("compare.rowArea"), value: (p) => `${p.area} m²` },
    { label: t("compare.rowFeatured"), value: (p) => (p.featured ? t("compare.yes") : t("compare.no")) },
  ];
  const idsParam = router.query.ids;
  const ids = useMemo(() => {
    if (typeof idsParam !== "string") return [];
    return idsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, MAX_COMPARE);
  }, [idsParam]);

  const compared = useMemo(
    () => ids.map((id) => allProps.find((p) => p.id === id)).filter((p): p is Property => !!p),
    [ids, allProps]
  );

  const whatsappForProperty = (p: Property) => {
    const msg = encodeURIComponent(
      t("whatsapp.propertyMessage", { title: p.title })
    );
    return `https://wa.me/${siteConfig.whatsapp}?text=${msg}`;
  };

  return (
    <Layout title={t("compare.metaTitle")} canonicalPath="/compare" noindex>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {t("compare.heading")}
            </h1>
            <p className="text-gray-600">
              {t("compare.subtitle", { max: MAX_COMPARE })}
            </p>
          </div>

          {compared.length < 2 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center max-w-2xl mx-auto">
              <div className="text-5xl mb-4">⚖️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t("compare.needAtLeastTwo")}
              </h2>
              <p className="text-gray-600 mb-6">
                {t("compare.needAtLeastTwoHint")}
              </p>
              <Link
                href="/favorites"
                className="inline-block bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {t("compare.goToFavorites")}
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-4 bg-gray-50 border-b border-gray-200 w-40 align-top">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          {t("compare.feature")}
                        </span>
                      </th>
                      {compared.map((p) => (
                        <th
                          key={p.id}
                          className="p-4 bg-gray-50 border-b border-l border-gray-200 align-top text-left"
                          style={{ minWidth: 240 }}
                        >
                          <div className="space-y-3">
                            <div className="relative h-40 rounded-md overflow-hidden">
                              <Image
                                src={p.images[0]}
                                alt={p.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 25vw"
                              />
                            </div>
                            <Link
                              href={`/properties/${p.slug}`}
                              className="block font-bold text-gray-900 hover:text-primary transition-colors text-base leading-snug"
                            >
                              {p.title}
                            </Link>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((row) => {
                      const values = compared.map((p) => row.value(p));
                      const stringValues = values.map((v) => String(v));
                      const allEqual = stringValues.every((v) => v === stringValues[0]);
                      return (
                        <tr key={row.label} className={allEqual ? "opacity-60" : ""}>
                          <th className="text-left p-4 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 align-top">
                            {row.label}
                          </th>
                          {compared.map((p, i) => (
                            <td
                              key={p.id}
                              className="p-4 border-b border-l border-gray-200 text-gray-900 align-top"
                            >
                              {values[i]}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                    <tr>
                      <th className="text-left p-4 bg-gray-50 text-sm font-medium text-gray-700 align-top">
                        {t("compare.actions")}
                      </th>
                      {compared.map((p) => (
                        <td key={p.id} className="p-4 border-l border-gray-200 align-top">
                          <div className="flex flex-col gap-2">
                            <Link
                              href={`/properties/${p.slug}`}
                              className="bg-primary hover:bg-primary/90 text-white text-center py-2 px-3 rounded-md text-sm font-medium transition-colors"
                            >
                              {t("compare.viewDetails")}
                            </Link>
                            <a
                              href={whatsappForProperty(p)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-green-500 hover:bg-green-600 text-white text-center py-2 px-3 rounded-md text-sm font-medium transition-colors"
                            >
                              {t("compare.whatsapp")}
                            </a>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-sm text-gray-500">
                {t("compare.dimmedNote")}
              </div>
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/favorites"
              className="text-primary hover:underline font-medium"
            >
              {t("compare.backToFavorites")}
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return getBaseStaticProps(locale);
};
