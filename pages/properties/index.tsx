import React, { useMemo, useState, useEffect, useCallback } from "react";
import { GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import Layout from "@/components/Layout";
import PropertyGrid from "@/components/PropertyGrid";
import PropertyFiltersUI from "@/components/PropertyFilters";
import Pagination from "@/components/Pagination";
import { localizeProperties } from "@/data/properties";
import { useProperties } from "@/contexts/SiteDataContext";
import { getBaseStaticProps } from "@/utils/pageData";
import {
  PropertyFilters,
  DEFAULT_FILTERS,
  filterProperties,
  filtersToQuery,
  queryToFilters,
} from "@/utils/filterProperties";

const PAGE_SIZE = 12;

export default function PropertiesPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { locale } = router;
  const allProperties = useProperties();
  const properties = useMemo(
    () => localizeProperties(allProperties, locale),
    [allProperties, locale]
  );
  const cities = useMemo(
    () => Array.from(new Set(allProperties.map((p) => p.city))),
    [allProperties]
  );

  // Filters — the URL is the source of truth. We initialize to default and
  // sync when router.isReady (otherwise there would be a flash of incorrect
  // properties when loading with filters in the URL).
  const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    setFilters(queryToFilters(router.query as Record<string, string | string[] | undefined>));
    const pageParam = router.query.page;
    const page = typeof pageParam === "string" ? Number(pageParam) : 1;
    setCurrentPage(Number.isFinite(page) && page >= 1 ? page : 1);
    setHydrated(true);
  }, [router.isReady, router.query]);

  // Memoized filtering
  const filtered = useMemo(
    () => filterProperties(properties, filters),
    [properties, filters]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const visible = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  // Pushes changes to the URL without reloading
  const pushQuery = useCallback(
    (nextFilters: PropertyFilters, nextPage: number) => {
      const query = filtersToQuery(nextFilters);
      if (nextPage > 1) query.page = String(nextPage);
      router.replace(
        { pathname: "/properties", query },
        undefined,
        { shallow: true, scroll: false }
      );
    },
    [router]
  );

  const handleFiltersChange = (next: PropertyFilters) => {
    setFilters(next);
    setCurrentPage(1);
    pushQuery(next, 1);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
    pushQuery(DEFAULT_FILTERS, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    pushQuery(filters, page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Layout
      title={t("properties.metaTitle")}
      description={t("properties.metaDescription")}
      canonicalPath="/properties"
    >
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t("properties.heading")}
            </h1>
            <p className="text-lg text-gray-600">
              {t("properties.subtitle")}
            </p>
          </div>

          {/* Filters */}
          <PropertyFiltersUI
            filters={filters}
            cities={cities}
            resultCount={filtered.length}
            onChange={handleFiltersChange}
            onReset={handleReset}
          />

          {/* Grid o empty state */}
          {hydrated && filtered.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-5xl mb-4">🔎</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {t("properties.emptyTitle")}
              </h2>
              <p className="text-gray-600 mb-6">
                {t("properties.emptyHint")}
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {t("properties.clearFilters")}
              </button>
              <p className="text-sm text-gray-500 mt-6">
                {t("properties.notFoundPrompt")}{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  {t("properties.contactUs")}
                </Link>{" "}
                {t("properties.andWeHelp")}
              </p>
            </div>
          ) : (
            <>
              <PropertyGrid properties={visible} />
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return getBaseStaticProps(locale);
};
