import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { useEffect, useMemo } from "react";
import { appWithTranslation } from "next-i18next";
import { siteConfig as defaultSiteConfig, SiteConfig } from "@/config/siteConfig";
import { properties as defaultProperties, Property } from "@/data/properties";
import {
  aboutContent as defaultAboutEs,
  aboutContentEn as defaultAboutEn,
  AboutContent,
} from "@/data/aboutPage";
import { SiteDataProvider } from "@/contexts/SiteDataContext";
import nextI18NextConfig from "../next-i18next.config";

interface SiteData {
  siteConfig: SiteConfig;
  properties: Property[];
  about: { es: AboutContent; en: AboutContent };
}

function App({ Component, pageProps }: AppProps) {
  // Every page's getStaticProps (or getServerSideProps) sets __siteData with
  // the effective data (Blobs override merged over defaults). If a page
  // doesn't provide it, we fall back to the file-baked defaults.
  const value = useMemo<SiteData>(() => {
    const injected = (pageProps as { __siteData?: SiteData }).__siteData;
    return (
      injected ?? {
        siteConfig: defaultSiteConfig,
        properties: defaultProperties,
        about: { es: defaultAboutEs, en: defaultAboutEn },
      }
    );
  }, [pageProps]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", value.siteConfig.primaryColor);
    root.style.setProperty("--color-secondary", value.siteConfig.secondaryColor);
  }, [value.siteConfig.primaryColor, value.siteConfig.secondaryColor]);

  return (
    <SiteDataProvider value={value}>
      <Component {...pageProps} />
    </SiteDataProvider>
  );
}

export default appWithTranslation(App, nextI18NextConfig);
