import type { NextApiRequest, NextApiResponse } from "next";
import { requireBroker } from "@/utils/adminAuth";
import { createPagesSupabaseClient } from "@/lib/supabase/pagesAuth";
import { saveBrandingToSupabase, triggerBuildAfterSave } from "@/lib/supabase/writeSitio";
import { SiteConfig } from "@/config/siteConfig";

interface ConfigResponse {
  ok: boolean;
  message: string;
  rebuild?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConfigResponse>,
) {
  const session = await requireBroker(req, res);
  if (!session) return;

  if (req.method !== "PUT") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const config: SiteConfig = req.body;

    if (!config.siteName || !config.logoText || !config.brokerName) {
      return res.status(400).json({ ok: false, message: "Faltan campos requeridos" });
    }
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(config.primaryColor)) {
      return res.status(400).json({ ok: false, message: "Color primario inválido" });
    }
    if (!hexColorRegex.test(config.secondaryColor)) {
      return res.status(400).json({ ok: false, message: "Color secundario inválido" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.email)) {
      return res.status(400).json({ ok: false, message: "Email inválido" });
    }

    const supabase = createPagesSupabaseClient(req, res);
    const { buildHookUrl } = await saveBrandingToSupabase(supabase, session.clienteId, config);
    const { triggered } = await triggerBuildAfterSave(buildHookUrl);

    return res.status(200).json({
      ok: true,
      message: triggered
        ? "Guardado. Los cambios estarán online en 2-3 minutos."
        : "Guardado. Contactá al equipo RealEX para publicar los cambios (falta build hook).",
      rebuild: triggered,
    });
  } catch (err) {
    console.error("Error saving config:", err);
    return res.status(500).json({
      ok: false,
      message: err instanceof Error ? err.message : "Error al guardar",
    });
  }
}
