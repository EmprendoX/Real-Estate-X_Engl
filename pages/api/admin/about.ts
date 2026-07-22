import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/utils/adminAuth";
import { getEffectiveAbout, saveAbout } from "@/utils/storage";
import type { AboutContent } from "@/data/aboutPage";

interface AboutResponse {
  ok: boolean;
  message?: string;
  content?: AboutContent;
}

function normalizeLocale(v: unknown): "es" | "en" | null {
  return v === "en" ? "en" : v === "es" ? "es" : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AboutResponse>
) {
  if (!requireAuth(req, res)) return;

  const locale = normalizeLocale(req.query.locale);
  if (!locale) {
    return res.status(400).json({
      ok: false,
      message: "Missing or invalid ?locale=es|en",
    });
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
      // Minimal shape validation — the admin form guarantees the rest.
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
      await saveAbout(locale, body);
      return res.status(200).json({
        ok: true,
        message: "About content saved successfully",
        content: body,
      });
    } catch (err) {
      console.error("Error saving About:", err);
      const detail = err instanceof Error ? err.message : String(err);
      return res.status(500).json({
        ok: false,
        message: `Error saving About: ${detail}`,
      });
    }
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ ok: false, message: "Method not allowed" });
}
