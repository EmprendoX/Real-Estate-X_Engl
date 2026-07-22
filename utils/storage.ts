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
import { writeSiteConfig, writeProperties } from "@/utils/fileWriter";

const SITE_KEY = "site-config.json";
const PROPERTIES_KEY = "properties.json";
const IMAGES_PREFIX = "images/";

const isNetlify = process.env.NETLIFY === "true";

function siteStore() {
  return getStore({ name: "site-data", consistency: "strong" });
}
function imagesStore() {
  return getStore({ name: "site-media", consistency: "strong" });
}

// ---------------- Site config ----------------

export async function getEffectiveSiteConfig(): Promise<SiteConfig> {
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

// ---------------- Properties ----------------

export async function getEffectiveProperties(): Promise<Property[]> {
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
