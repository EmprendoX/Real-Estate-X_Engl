/**
 * Fetches this site's config from Supabase via the `site-config` edge function,
 * keyed by CLIENT_ID (the sitios.id UUID). Memoized per-process so that a
 * single Next.js build only makes ONE round-trip regardless of how many pages
 * pull config from getEffective*().
 *
 * Returns null if CLIENT_ID is unset (dev without Supabase → caller falls back
 * to file defaults) or if the fetch fails (never crashes the build).
 */

import type { SiteConfig } from "@/config/siteConfig";
import type { Property } from "@/data/properties";
import type { AboutContent } from "@/data/aboutPage";

export interface TemplateConfig {
  branding: SiteConfig;
  properties: Property[];
  about: {
    es: AboutContent;
    en?: AboutContent;
  };
  testimonials?: unknown[];
}

interface EdgeSuccess { config: TemplateConfig; }
interface EdgeError   { error: string; }

let cache: TemplateConfig | null = null;
let cachePromise: Promise<TemplateConfig | null> | null = null;

function getSupabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function isSupabaseMode(): boolean {
  return !!(process.env.CLIENT_ID && getSupabaseUrl());
}

export async function getTemplateConfig(): Promise<TemplateConfig | null> {
  if (cache) return cache;
  if (cachePromise) return cachePromise;

  const clientId = process.env.CLIENT_ID;
  const supabaseUrl = getSupabaseUrl();
  if (!clientId || !supabaseUrl) return null;

  cachePromise = (async () => {
    try {
      const url = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/site-config?client_id=${encodeURIComponent(clientId)}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`[configClient] site-config returned ${res.status}: ${await res.text().catch(() => "<no body>")}`);
        return null;
      }
      const body = (await res.json()) as EdgeSuccess | EdgeError;
      if ("error" in body) {
        console.error(`[configClient] site-config error: ${body.error}`);
        return null;
      }
      cache = body.config;
      return cache;
    } catch (err) {
      console.error("[configClient] fetch failed:", err);
      return null;
    } finally {
      cachePromise = null;
    }
  })();

  return cachePromise;
}
