import React, { useMemo, useState } from "react";
import { GetStaticProps } from "next";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import Layout from "@/components/Layout";
import { localizeProperties } from "@/data/properties";
import { useFavorites } from "@/utils/useFavorites";
import { formatPrice } from "@/utils/formatPrice";
import { useProperties } from "@/contexts/SiteDataContext";
import { getBaseStaticProps } from "@/utils/pageData";

const MAX_COMPARE = 3;

export default function FavoritesPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { locale } = router;
  const properties = useProperties();
  const allProps = useMemo(
    () => localizeProperties(properties, locale),
    [properties, locale]
  );
  const { favorites, hydrated, toggle, clear } = useFavorites();
  const [selected, setSelected] = useState<string[]>([]);

  const favoriteProperties = useMemo(
    () => allProps.filter((p) => favorites.includes(p.id)),
    [allProps, favorites]
  );

  const toggleSelection = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const goCompare = () => {
    if (selected.length < 2) return;
    router.push(`/compare?ids=${selected.join(",")}`);
  };

  // Before hydrating we show a neutral skeleton to avoid a flash of "none"
  if (!hydrated) {
    return (
      <Layout title={t("favorites.metaTitle")} canonicalPath="/favorites" noindex>
        <div className="bg-gray-50 min-h-screen py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
              {t("favorites.heading")}
            </h1>
            <p className="text-center text-gray-500">{t("favorites.loading")}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t("favorites.metaTitle")} canonicalPath="/favorites" noindex>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t("favorites.heading")}
            </h1>
            <p className="text-lg text-gray-600">
              {t("favorites.subtitle")}
            </p>
          </div>

          {favoriteProperties.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center max-w-2xl mx-auto">
              <div className="text-6xl mb-4">💔</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t("favorites.emptyTitle")}
              </h2>
              <p className="text-gray-600 mb-6">
                {t("favorites.emptyHint")}
              </p>
              <Link
                href="/properties"
                className="inline-block bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {t("favorites.viewProperties")}
              </Link>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-gray-700">
                  <span className="font-semibold">{favoriteProperties.length}</span>{" "}
                  {t("favorites.savedCount", { count: favoriteProperties.length })}
                  {selected.length > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      {t("favorites.selectedForCompare", { count: selected.length })}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(t("favorites.clearListConfirm"))) {
                        clear();
                        setSelected([]);
                      }
                    }}
                    className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                  >
                    {t("favorites.clearList")}
                  </button>
                  <button
                    type="button"
                    onClick={goCompare}
                    disabled={selected.length < 2}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {t("favorites.compare", { count: selected.length })}
                  </button>
                </div>
              </div>

              {selected.length === 0 && (
                <p className="text-sm text-gray-500 mb-4 text-center">
                  {t("favorites.compareHint", { max: MAX_COMPARE })}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteProperties.map((p) => {
                  const isSelected = selected.includes(p.id);
                  const reachedMax =
                    !isSelected && selected.length >= MAX_COMPARE;
                  return (
                    <div
                      key={p.id}
                      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${
                        isSelected ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className="relative h-48 w-full">
                        <Image
                          src={p.images[0]}
                          alt={p.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        <button
                          type="button"
                          onClick={() => toggle(p.id)}
                          aria-label={t("favorites.removeFromFavorites")}
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center"
                        >
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                          {p.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          📍 {p.location}, {p.city}
                        </p>
                        <p className="text-xl font-bold text-primary mb-4">
                          {formatPrice(p.price, p.currency)}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <label
                            className={`flex items-center gap-2 text-sm ${
                              reachedMax ? "text-gray-400 cursor-not-allowed" : "text-gray-700 cursor-pointer"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={reachedMax}
                              onChange={() => toggleSelection(p.id)}
                              className="rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed"
                            />
                            {t("favorites.compareCheckbox")}
                          </label>
                          <Link
                            href={`/properties/${p.slug}`}
                            className="text-sm text-primary hover:underline font-medium"
                          >
                            {t("favorites.viewDetails")}
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
