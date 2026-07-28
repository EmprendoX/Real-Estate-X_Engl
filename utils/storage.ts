/**
 * Storage layer.
 *
 * On Netlify (production): reads/writes go to Netlify Blobs. Auto-provisioned
 * per site, zero client setup.
 *
 * On local dev: reads/writes go to the filesystem (public/images and the .ts
 * data files), preserving the current dev-time editing workflow.
 *
 * Consumers should never call this layer if `siteConfig` / `properties` are
 * fine as static defaults — they should call getEffectiveSiteConfig() /
 * getEffectiveProperties() which merge the Blobs override on top of the
 * file-baked defaults.
 */

import fs from "fs";
import path from "path";
import { getStore } from "@netlify/blobs";
import { siteConfig as defaultSiteConfig, SiteConfig } from "@/config/siteConfig";
import { properties as defaultProperties, Property } from "@/data/properties";
import {
  aboutContent as defaultAboutEs,
  aboutContentEn as defaultAboutEn,
  AboutContent,
} from "@/data/aboutPage";
import { writeSiteConfig, writeProperties } from "@/utils/fileWriter";
import { getTemplateConfig, isSupabaseMode } from "@/lib/supabase/configClient";

const SITE_KEY = "site-config.json";
const PROPERTIES_KEY = "properties.json";
const IMAGES_PREFIX = "images/";
const ABOUT_KEY_ES = "about-es.json";
const ABOUT_KEY_EN = "about-en.json";
const ABOUT_LOCAL_ES = path.join(process.cwd(), "config", "about-es.local.json");
const ABOUT_LOCAL_EN = path.join(process.cwd(), "config", "about-en.local.json");

// Netlify sets `NETLIFY=true` at BUILD time, but does not reliably expose it
// to Next.js SSR/API Lambda functions at runtime. Detect the deployed runtime
// via signals that ARE always present on Lambda + Netlify:
//   - LAMBDA_TASK_ROOT: set by AWS Lambda (Netlify Functions run on Lambda).
//   - NETLIFY_BLOBS_CONTEXT: injected by the Netlify Next.js plugin for
//     Blobs access — its presence guarantees Blobs will work.
//   - NETLIFY=true: still true at build time (matters for pre-render).
const isNetlify =
  process.env.NETLIFY === "true" ||
  !!process.env.NETLIFY_BLOBS_CONTEXT ||
  !!process.env.LAMBDA_TASK_ROOT;

function siteStore() {
  return getStore({ name: "site-data", consistency: "strong" });
}
function imagesStore() {
  return getStore({ name: "site-media", consistency: "strong" });
}

// ---------------- Site config ----------------

export async function getEffectiveSiteConfig(): Promise<SiteConfig> {
  if (isSupabaseMode()) {
    const cfg = await getTemplateConfig();
    // Merge over defaults so a config missing an optional field keeps the seed.
    if (cfg?.branding) return { ...defaultSiteConfig, ...cfg.branding };
    // Fall through to Blobs/defaults on fetch failure so the site never breaks.
  }
  if (!isNetlify) return defaultSiteConfig;
  try {
    const raw = await siteStore().get(SITE_KEY, { type: "text" });
    if (!raw) return defaultSiteConfig;
    const override = JSON.parse(raw) as Partial<SiteConfig>;
    return { ...defaultSiteConfig, ...override };
  } catch (err) {
    console.error("[storage] getEffectiveSiteConfig fell back to default:", err);
    return defaultSiteConfig;
  }
}

export async function saveSiteConfig(config: SiteConfig): Promise<void> {
  if (!isNetlify) {
    writeSiteConfig(config);
    return;
  }
  await siteStore().set(SITE_KEY, JSON.stringify(config));
}

// ---------------- About content (per-locale) ----------------

function aboutDefault(locale: "es" | "en"): AboutContent {
  return locale === "en" ? defaultAboutEn : defaultAboutEs;
}
function aboutBlobKey(locale: "es" | "en"): string {
  return locale === "en" ? ABOUT_KEY_EN : ABOUT_KEY_ES;
}
function aboutLocalPath(locale: "es" | "en"): string {
  return locale === "en" ? ABOUT_LOCAL_EN : ABOUT_LOCAL_ES;
}

export async function getEffectiveAbout(
  locale: "es" | "en"
): Promise<AboutContent> {
  const fallback = aboutDefault(locale);
  if (isSupabaseMode()) {
    const cfg = await getTemplateConfig();
    const supaAbout = cfg?.about?.[locale];
    if (supaAbout) return { ...fallback, ...supaAbout };
    // Fall through on fetch failure.
  }
  if (!isNetlify) {
    // Local dev: read a JSON override file if present, otherwise the .ts default.
    try {
      const p = aboutLocalPath(locale);
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        const override = JSON.parse(raw) as Partial<AboutContent>;
        return { ...fallback, ...override };
      }
    } catch (err) {
      console.error("[storage] getEffectiveAbout local read failed:", err);
    }
    return fallback;
  }
  try {
    const raw = await siteStore().get(aboutBlobKey(locale), { type: "text" });
    if (!raw) return fallback;
    const override = JSON.parse(raw) as Partial<AboutContent>;
    return { ...fallback, ...override };
  } catch (err) {
    console.error("[storage] getEffectiveAbout fell back to default:", err);
    return fallback;
  }
}

export async function saveAbout(
  locale: "es" | "en",
  content: AboutContent
): Promise<void> {
  if (!isNetlify) {
    const p = aboutLocalPath(locale);
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(p, JSON.stringify(content, null, 2), "utf-8");
    return;
  }
  await siteStore().set(aboutBlobKey(locale), JSON.stringify(content));
}

// ---------------- Properties ----------------

export async function getEffectiveProperties(): Promise<Property[]> {
  if (isSupabaseMode()) {
    const cfg = await getTemplateConfig();
    if (cfg?.properties) return cfg.properties;
    // Fall through on fetch failure.
  }
  if (!isNetlify) return defaultProperties;
  try {
    const raw = await siteStore().get(PROPERTIES_KEY, { type: "text" });
    if (!raw) return defaultProperties;
    return JSON.parse(raw) as Property[];
  } catch (err) {
    console.error("[storage] getEffectiveProperties fell back to default:", err);
    return defaultProperties;
  }
}

export async function saveProperties(list: Property[]): Promise<void> {
  if (!isNetlify) {
    writeProperties(list);
    return;
  }
  await siteStore().set(PROPERTIES_KEY, JSON.stringify(list));
}

// ---------------- Images ----------------

export interface SavedImage {
  url: string; // The URL to store in siteConfig/properties
}

/** Save uploaded image bytes; returns the URL that the site should render. */
export async function saveImage(
  filename: string,
  bytes: Buffer,
  contentType: string
): Promise<SavedImage> {
  if (!isNetlify) {
    const uploadDir = path.join(process.cwd(), "public", "images");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, filename), bytes);
    return { url: `/images/${filename}` };
  }
  // Netlify Blobs expects ArrayBuffer; copy so we don't hand it a Node Buffer
  // whose backing ArrayBufferLike doesn't match the DOM's ArrayBuffer.
  const arrayBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
  await imagesStore().set(IMAGES_PREFIX + filename, arrayBuffer, {
    metadata: { contentType },
  });
  return { url: `/api/media/${encodeURIComponent(filename)}` };
}

/** Read image bytes for serving from /api/media/[name]. Netlify-only path. */
export async function readImage(
  filename: string
): Promise<{ bytes: ArrayBuffer; contentType: string } | null> {
  if (!isNetlify) return null;
  try {
    const store = imagesStore();
    const key = IMAGES_PREFIX + filename;
    const result = await store.getWithMetadata(key, { type: "arrayBuffer" });
    if (!result || !result.data) return null;
    const meta = result.metadata as { contentType?: string } | undefined;
    return {
      bytes: result.data as ArrayBuffer,
      contentType: meta?.contentType || "application/octet-stream",
    };
  } catch (err) {
    console.error("[storage] readImage error:", err);
    return null;
  }
}
