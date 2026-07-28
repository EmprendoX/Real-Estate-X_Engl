/**
 * Helpers para escribir al `sitios.config` JSONB desde el /admin del template.
 * Todas las funciones esperan un supabase client autenticado con la sesión
 * del broker; la RLS del row (sitios policy `broker_updates_own_sitio`)
 * bloquea escrituras a otros sitios automáticamente.
 *
 * Después de cada save exitoso disparamos un rebuild del site Netlify vía
 * build hook (URL guardada en sitios.netlify_build_hook_url) si está seteado.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { SiteConfig } from "@/config/siteConfig";
import type { Property } from "@/data/properties";
import type { AboutContent } from "@/data/aboutPage";

async function currentSitio(supabase: SupabaseClient, clienteId: string) {
  const { data, error } = await supabase
    .from("sitios")
    .select("id, config, netlify_build_hook_url")
    .eq("cliente_id", clienteId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Sitio no encontrado para este cliente");
  return data;
}

async function updateConfig(
  supabase: SupabaseClient,
  clienteId: string,
  mutate: (current: Record<string, unknown>) => Record<string, unknown>,
) {
  const sitio = await currentSitio(supabase, clienteId);
  const currentConfig = (sitio.config as Record<string, unknown>) || {};
  const nextConfig = mutate(currentConfig);
  const { error } = await supabase
    .from("sitios")
    .update({ config: nextConfig })
    .eq("id", sitio.id);
  if (error) throw error;
  return { sitioId: sitio.id, buildHookUrl: sitio.netlify_build_hook_url };
}

export async function saveBrandingToSupabase(
  supabase: SupabaseClient,
  clienteId: string,
  branding: SiteConfig,
) {
  return updateConfig(supabase, clienteId, (cfg) => ({ ...cfg, branding }));
}

export async function savePropertiesToSupabase(
  supabase: SupabaseClient,
  clienteId: string,
  properties: Property[],
) {
  return updateConfig(supabase, clienteId, (cfg) => ({ ...cfg, properties }));
}

export async function saveAboutToSupabase(
  supabase: SupabaseClient,
  clienteId: string,
  locale: "es" | "en",
  content: AboutContent,
) {
  return updateConfig(supabase, clienteId, (cfg) => {
    const currentAbout = (cfg.about as Record<string, unknown>) || {};
    return { ...cfg, about: { ...currentAbout, [locale]: content } };
  });
}

/** Uploads bytes to storage bucket `site-media` under `<clienteId>/<filename>`. */
export async function uploadImageToSupabase(
  supabase: SupabaseClient,
  clienteId: string,
  filename: string,
  bytes: Buffer,
  contentType: string,
): Promise<{ url: string }> {
  const path = `${clienteId}/${filename}`;
  const { error } = await supabase.storage
    .from("site-media")
    .upload(path, bytes, {
      contentType,
      upsert: true,
      cacheControl: "3600",
    });
  if (error) throw error;

  const { data: pub } = supabase.storage.from("site-media").getPublicUrl(path);
  return { url: pub.publicUrl };
}

/**
 * Fire-and-forget Netlify build hook. If the sitio doesn't have a hook URL
 * saved yet, do nothing (operator has to paste it once from Netlify UI).
 * Returns { triggered: true } if a hook was invoked.
 */
export async function triggerBuildAfterSave(
  buildHookUrl: string | null,
): Promise<{ triggered: boolean }> {
  if (!buildHookUrl) return { triggered: false };
  try {
    await fetch(buildHookUrl, { method: "POST" });
    return { triggered: true };
  } catch (err) {
    console.error("[triggerBuildAfterSave] failed:", err);
    return { triggered: false };
  }
}
