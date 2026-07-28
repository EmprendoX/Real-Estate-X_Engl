/**
 * Runs the template's storage layer in Supabase mode and prints the effective
 * siteConfig.slogan. Used to prove that when CLIENT_ID + SUPABASE_URL are set,
 * the template pulls from Supabase and NOT from the file-baked defaults.
 *
 * Usage:
 *   CLIENT_ID=<uuid> SUPABASE_URL=https://... npx tsx scripts/verify-supabase-mode.ts
 */

import { getEffectiveSiteConfig, getEffectiveProperties } from "@/utils/storage";

async function main() {
  const cfg = await getEffectiveSiteConfig();
  const properties = await getEffectiveProperties();

  const mode = process.env.CLIENT_ID ? "supabase" : "file-defaults";
  console.log(JSON.stringify({
    mode,
    client_id: process.env.CLIENT_ID ?? null,
    siteName: cfg.siteName,
    slogan: cfg.slogan,
    propertiesCount: properties.length,
    firstPropertyTitle: properties[0]?.title ?? null,
  }, null, 2));
}

main().catch((err) => {
  console.error("verify-supabase-mode failed:", err);
  process.exit(1);
});
