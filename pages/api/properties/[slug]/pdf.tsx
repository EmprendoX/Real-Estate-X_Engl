import type { NextApiRequest, NextApiResponse } from "next";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { localizeProperty } from "@/data/properties";
import type { SiteConfig } from "@/config/siteConfig";
import { getEffectiveSiteConfig, getEffectiveProperties } from "@/utils/storage";
import PropertyPDF from "@/components/pdf/PropertyPDF";

/**
 * GET /api/properties/[slug]/pdf
 *
 * Returns a property PDF sheet ready to download / print.
 * It's public (any visitor can generate the PDF of any property).
 */

function baseUrlFromRequest(req: NextApiRequest, siteConfig: SiteConfig): string {
  if (siteConfig.siteUrl && /^https?:\/\//.test(siteConfig.siteUrl)) {
    return siteConfig.siteUrl.replace(/\/$/, "");
  }
  const proto =
    (req.headers["x-forwarded-proto"] as string | undefined) || "http";
  const host = (req.headers["x-forwarded-host"] || req.headers.host) as string;
  return `${proto}://${host}`;
}

function toAbsoluteImageUrl(src: string, baseUrl: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  return `${baseUrl}${src.startsWith("/") ? src : `/${src}`}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, message: "Método no permitido" });
  }

  const slug = req.query.slug;
  if (typeof slug !== "string") {
    return res.status(400).json({ ok: false, message: "Slug inválido" });
  }

  const [siteConfig, propertyList] = await Promise.all([
    getEffectiveSiteConfig(),
    getEffectiveProperties(),
  ]);
  const rawProperty = propertyList.find((p) => p.slug === slug);
  if (!rawProperty) {
    return res.status(404).json({ ok: false, message: "Propiedad no encontrada" });
  }

  // Language: "en" or "es" (default). Comes from the ?lang= query param.
  const langParam = Array.isArray(req.query.lang)
    ? req.query.lang[0]
    : req.query.lang;
  const locale = langParam === "en" ? "en" : "es";

  // Localize the property text (title/description) to the requested language.
  const property = localizeProperty(rawProperty, locale);

  try {
    const baseUrl = baseUrlFromRequest(req, siteConfig);
    const localePrefix = locale === "en" ? "/en" : "";
    const propertyUrl = `${baseUrl}${localePrefix}/properties/${property.slug}`;
    const absoluteImages = property.images.map((img) =>
      toAbsoluteImageUrl(img, baseUrl)
    );
    const generatedAt = new Date().toLocaleString(
      locale === "en" ? "en-US" : "es-MX",
      {
        dateStyle: "long",
        timeStyle: "short",
      }
    );

    const buffer = await renderToBuffer(
      <PropertyPDF
        property={property}
        siteConfig={siteConfig}
        propertyUrl={propertyUrl}
        images={absoluteImages}
        generatedAt={generatedAt}
        locale={locale}
      />
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${property.slug}.pdf"`
    );
    // The PDF reflects static property data; we can cache it for a few minutes
    // on the CDN. The detail page's ISR is also 60s, so we keep it in line.
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
    return res.send(buffer);
  } catch (error) {
    console.error("Error generando PDF:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al generar el PDF",
    });
  }
}
