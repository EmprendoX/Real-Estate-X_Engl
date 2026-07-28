import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/utils/adminAuth";
import { guardReadOnly } from "@/utils/adminReadOnly";
import { saveSiteConfig } from "@/utils/storage";
import { SiteConfig } from "@/config/siteConfig";

interface ConfigResponse {
  ok: boolean;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConfigResponse>
) {
  // Check authentication
  if (!requireAuth(req, res)) {
    return;
  }
  if (guardReadOnly(req, res)) return;

  if (req.method !== "PUT") {
    return res.status(405).json({
      ok: false,
      message: "Method not allowed",
    });
  }

  try {
    const config: SiteConfig = req.body;

    // Basic validations
    if (!config.siteName || !config.logoText || !config.brokerName) {
      return res.status(400).json({
        ok: false,
        message: "Missing required fields",
      });
    }

    // Validate hex color format
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(config.primaryColor)) {
      return res.status(400).json({
        ok: false,
        message: "Invalid primary color (must be hex format)",
      });
    }
    if (!hexColorRegex.test(config.secondaryColor)) {
      return res.status(400).json({
        ok: false,
        message: "Invalid secondary color (must be hex format)",
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.email)) {
      return res.status(400).json({
        ok: false,
        message: "Invalid email",
      });
    }

    // Save the settings (Blobs on Netlify, file in dev)
    await saveSiteConfig(config);

    return res.status(200).json({
      ok: true,
      message: "Settings saved successfully",
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    return res.status(500).json({
      ok: false,
      message: "Error saving the settings",
    });
  }
}


