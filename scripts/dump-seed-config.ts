/**
 * Dumps the current file-baked defaults (siteConfig + properties + about ES/EN)
 * as a single JSON blob to stdout. Used to seed the demo client in the RealEX
 * dashboard's Supabase project so the deployed test site is pixel-parity with
 * the current live site.
 *
 * Usage: tsx scripts/dump-seed-config.ts > /tmp/demo-config.json
 */

import { siteConfig } from "@/config/siteConfig";
import { properties } from "@/data/properties";
import { aboutContent, aboutContentEn } from "@/data/aboutPage";
import { testimonials } from "@/data/testimonials";

const config = {
  branding: siteConfig,
  properties,
  about: {
    es: aboutContent,
    en: aboutContentEn,
  },
  testimonials,
};

process.stdout.write(JSON.stringify(config, null, 2));
