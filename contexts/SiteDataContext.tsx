import React, { createContext, useContext } from "react";
import { siteConfig as defaultSiteConfig, SiteConfig } from "@/config/siteConfig";
import { properties as defaultProperties, Property } from "@/data/properties";

/**
 * Injects the effective site config and properties (Netlify Blobs override
 * merged over the file-baked defaults) into every page and component, so no
 * caller has to know or care about where the data lives.
 *
 * Populated by `_app.tsx#getInitialProps`; always has a value, so
 * `useSiteConfig()` / `useProperties()` are safe to call unconditionally.
 */

interface SiteData {
  siteConfig: SiteConfig;
  properties: Property[];
}

const SiteDataContext = createContext<SiteData>({
  siteConfig: defaultSiteConfig,
  properties: defaultProperties,
});

export function SiteDataProvider({
  value,
  children,
}: {
  value: SiteData;
  children: React.ReactNode;
}) {
  return (
    <SiteDataContext.Provider value={value}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteConfig(): SiteConfig {
  return useContext(SiteDataContext).siteConfig;
}

export function useProperties(): Property[] {
  return useContext(SiteDataContext).properties;
}
