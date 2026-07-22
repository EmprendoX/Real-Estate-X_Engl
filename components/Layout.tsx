import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useSiteConfig } from "@/contexts/SiteDataContext";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  image?: string;
  canonicalPath?: string;
  noindex?: boolean;
  jsonLd?: object;
}

function toAbsoluteUrl(urlOrPath: string | undefined, base: string): string | undefined {
  if (!urlOrPath) return undefined;
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath;
  const path = urlOrPath.startsWith("/") ? urlOrPath : `/${urlOrPath}`;
  return `${base.replace(/\/$/, "")}${path}`;
}

export default function Layout({
  children,
  title,
  description,
  image,
  canonicalPath,
  noindex,
  jsonLd,
}: LayoutProps) {
  const { t } = useTranslation("common");
  const { locale } = useRouter();
  const siteConfig = useSiteConfig();
  const ogLocale = locale === "en" ? "en_US" : "es_MX";
  const pageTitle = title
    ? `${title} | ${siteConfig.siteName}`
    : `${siteConfig.siteName} - ${siteConfig.slogan}`;
  const pageDescription =
    description ||
    t("layout.defaultDescription", {
      city: siteConfig.city,
      slogan: siteConfig.slogan,
    });

  const baseUrl = siteConfig.siteUrl.replace(/\/$/, "");
  const canonical = canonicalPath
    ? `${baseUrl}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`
    : baseUrl;
  const ogImage = toAbsoluteUrl(image, baseUrl);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href={canonical} />
        {noindex && <meta name="robots" content="noindex,nofollow" />}

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteConfig.siteName} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonical} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:locale" content={ogLocale} />

        {/* Twitter */}
        <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}

        {/* Structured JSON-LD */}
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
      </Head>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />

        {/* Conditional injection of the chat script */}
        {siteConfig.chatScript && (
          <div
            dangerouslySetInnerHTML={{ __html: siteConfig.chatScript }}
          />
        )}
      </div>
    </>
  );
}
