import type { NextApiRequest, NextApiResponse } from "next";
import { requireBroker } from "@/utils/adminAuth";
import { createPagesSupabaseClient } from "@/lib/supabase/pagesAuth";
import { getEffectiveAbout } from "@/utils/storage";
import { saveAboutToSupabase, triggerBuildAfterSave } from "@/lib/supabase/writeSitio";
import type { AboutContent } from "@/data/aboutPage";

interface AboutResponse {
  ok: boolean;
  message?: string;
  content?: AboutContent;
  rebuild?: boolean;
}

function normalizeLocale(v: unknown): "es" | "en" | null {
  return v === "en" ? "en" : v === "es" ? "es" : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AboutResponse>,
) {
  const session = await requireBroker(req, res);
  if (!session) return;

  const locale = normalizeLocale(req.query.locale);
  if (!locale) {
    return res.status(400).json({ ok: false, message: "Missing or invalid ?locale=es|en" });
  }

  if (req.method === "GET") {
    const content = await getEffectiveAbout(locale);
    return res.status(200).json({ ok: true, content });
  }

  if (req.method === "PUT") {
    try {
      const body = req.body as AboutContent;
      if (!body || typeof body !== "object") {
        return res.status(400).json({ ok: false, message: "Invalid body" });
      }
      if (
        !body.bio ||
        !body.howIWork ||
        !body.whyMe ||
        !Array.isArray(body.bio.paragraphs) ||
        !Array.isArray(body.howIWork.pillars) ||
        !Array.isArray(body.whyMe.items)
      ) {
        return res.status(400).json({ ok: false, message: "Malformed About content" });
      }

      const supabase = createPagesSupabaseClient(req, res);
      const { buildHookUrl } = await saveAboutToSupabase(supabase, session.clienteId, locale, body);
      const { triggered } = await triggerBuildAfterSave(buildHookUrl);

      return res.status(200).json({
        ok: true,
        message: triggered
          ? "Guardado. Los cambios estarán online en 2-3 minutos."
          : "Guardado. Contactá al equipo RealEX para publicar (falta build hook).",
        content: body,
        rebuild: triggered,
      });
    } catch (err) {
      console.error("Error saving About:", err);
      const detail = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ ok: false, message: `Error: ${detail}` });
    }
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ ok: false, message: "Method not allowed" });
}
