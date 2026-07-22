import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import nextI18NextConfig from "../next-i18next.config";
import { getEffectiveSiteConfig, getEffectiveProperties } from "@/utils/storage";

const DEFAULT_REVALIDATE_SECONDS = 30;

/**
 * Next.js's getStaticProps refuses to serialize `undefined`. Our SiteConfig
 * and Property types use `undefined` for optional fields — round-trip through
 * JSON to drop them, which is what Next would do at the boundary anyway.
 */
export function jsonSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Returns the props every page needs so the SiteDataProvider in _app.tsx
 * receives the effective (Blobs-overridden) siteConfig + properties, plus
 * i18n translations. Call from getStaticProps.
 */
export async function getBaseStaticProps(
  locale: string | undefined,
  namespaces: string[] = ["common"]
) {
  const [siteConfig, properties, translations] = await Promise.all([
    getEffectiveSiteConfig(),
    getEffectiveProperties(),
    serverSideTranslations(locale ?? "es", namespaces, nextI18NextConfig),
  ]);

  return {
    props: {
      ...translations,
      __siteData: jsonSafe({ siteConfig, properties }),
    },
    revalidate: DEFAULT_REVALIDATE_SECONDS,
  };
}

/**
 * Same as getBaseStaticProps but for admin pages: uses getServerSideProps so
 * the admin always sees the freshest data (no ISR cache).
 */
export async function getAdminServerSideProps(
  locale: string | undefined,
  namespaces: string[] = ["common"]
) {
  const [siteConfig, properties, translations] = await Promise.all([
    getEffectiveSiteConfig(),
    getEffectiveProperties(),
    serverSideTranslations(locale ?? "es", namespaces, nextI18NextConfig),
  ]);

  return {
    props: {
      ...translations,
      __siteData: jsonSafe({ siteConfig, properties }),
    },
  };
}
