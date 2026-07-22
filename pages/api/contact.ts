import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import type { SiteConfig } from "@/config/siteConfig";
import { getEffectiveSiteConfig, getEffectiveProperties } from "@/utils/storage";
import { formatPrice } from "@/utils/formatPrice";

interface ContactRequestBody {
  name: string;
  email: string;
  phone?: string;
  message: string;
  propertyId?: string;
}

interface ContactResponse {
  ok: boolean;
  message: string;
}

interface LeadEmailData {
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId: string | null;
  propertyTitle: string | null;
  propertyUrl: string | null;
  timestamp: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildLeadEmailHtml(data: LeadEmailData, siteConfig: SiteConfig): string {
  const propertyBlock = data.propertyTitle
    ? `
      <tr>
        <td style="padding: 12px 0; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Propiedad de interés</p>
          <p style="margin: 0; font-size: 16px; color: #111827; font-weight: 600;">${escapeHtml(data.propertyTitle)}</p>
          ${data.propertyUrl ? `<p style="margin: 4px 0 0;"><a href="${data.propertyUrl}" style="color: ${siteConfig.primaryColor}; font-size: 14px;">Ver propiedad →</a></p>` : ""}
        </td>
      </tr>`
    : "";

  const phoneBlock = data.phone
    ? `
      <tr>
        <td style="padding: 12px 0; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Teléfono</p>
          <p style="margin: 0; font-size: 16px; color: #111827;"><a href="tel:${escapeHtml(data.phone)}" style="color: #111827; text-decoration: none;">${escapeHtml(data.phone)}</a></p>
        </td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 560px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <tr>
            <td style="background: ${siteConfig.primaryColor}; padding: 24px 32px;">
              <p style="margin: 0; color: #ffffff; font-size: 14px; opacity: 0.9;">${escapeHtml(siteConfig.siteName)}</p>
              <h1 style="margin: 4px 0 0; color: #ffffff; font-size: 22px;">🎯 Nuevo lead recibido</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 0 12px;">
                    <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Nombre</p>
                    <p style="margin: 0; font-size: 18px; color: #111827; font-weight: 600;">${escapeHtml(data.name)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Email</p>
                    <p style="margin: 0; font-size: 16px; color: #111827;"><a href="mailto:${escapeHtml(data.email)}" style="color: ${siteConfig.primaryColor}; text-decoration: none;">${escapeHtml(data.email)}</a></p>
                  </td>
                </tr>
                ${phoneBlock}
                ${propertyBlock}
                <tr>
                  <td style="padding: 12px 0; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Mensaje</p>
                    <p style="margin: 0; font-size: 15px; color: #111827; line-height: 1.6; white-space: pre-line;">${escapeHtml(data.message)}</p>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 24px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
                <p style="margin: 0; font-size: 13px; color: #6b7280;">
                  💡 Respondé a este email para contactar al lead directamente. Su email ya está configurado como destinatario.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 24px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Recibido el ${new Date(data.timestamp).toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" })}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildLeadEmailText(data: LeadEmailData, siteConfig: SiteConfig): string {
  const lines = [
    `Nuevo lead recibido en ${siteConfig.siteName}`,
    "",
    `Nombre: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Teléfono: ${data.phone}` : null,
    data.propertyTitle ? `Propiedad: ${data.propertyTitle}` : null,
    data.propertyUrl ? `URL: ${data.propertyUrl}` : null,
    "",
    "Mensaje:",
    data.message,
    "",
    `Recibido: ${data.timestamp}`,
    "",
    "Respondé a este email para contactar al lead.",
  ];
  return lines.filter(Boolean).join("\n");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContactResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "Método no permitido",
    });
  }

  try {
    const [siteConfig, properties] = await Promise.all([
      getEffectiveSiteConfig(),
      getEffectiveProperties(),
    ]);
    const { name, email, phone, message, propertyId }: ContactRequestBody =
      req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ ok: false, message: "El nombre es obligatorio" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ ok: false, message: "El email es obligatorio" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ ok: false, message: "El email no es válido" });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ ok: false, message: "El mensaje es obligatorio" });
    }

    // Enrich with property data if a propertyId was provided
    const property = propertyId
      ? properties.find((p) => p.id === propertyId)
      : undefined;

    const baseUrl = siteConfig.siteUrl.replace(/\/$/, "");
    const propertyUrl = property ? `${baseUrl}/properties/${property.slug}` : null;
    const propertyTitle = property
      ? `${property.title} — ${formatPrice(property.price, property.currency)}`
      : null;

    const leadData: LeadEmailData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || "",
      message: message.trim(),
      propertyId: propertyId || null,
      propertyTitle,
      propertyUrl,
      timestamp: new Date().toISOString(),
    };

    // Always log (useful for debugging and as a backup if Resend fails)
    console.log("=== NUEVO LEAD ===");
    console.log(JSON.stringify(leadData, null, 2));

    // 1) Email to the broker via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const fromEmail = process.env.LEAD_FROM_EMAIL || "onboarding@resend.dev";
      const fromName = siteConfig.siteName;

      try {
        const result = await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: siteConfig.email,
          replyTo: leadData.email,
          subject: property
            ? `Nuevo lead: ${property.title}`
            : `Nuevo lead de ${leadData.name}`,
          html: buildLeadEmailHtml(leadData, siteConfig),
          text: buildLeadEmailText(leadData, siteConfig),
        });
        if (result.error) {
          console.error("Error de Resend:", result.error);
        } else {
          console.log("Email enviado, id:", result.data?.id);
        }
      } catch (emailError) {
        // Don't fail the response — the product decision is not to lose leads
        // over transient Resend errors. The lead remains in the logs.
        console.error("Excepción enviando email:", emailError);
      }
    } else {
      console.warn(
        "RESEND_API_KEY no configurada — el lead no se envió por email. Configurar en variables de entorno."
      );
    }

    // 2) Optional webhook (Make/Zapier/CRM)
    if (siteConfig.leadWebhookUrl) {
      try {
        const webhookResponse = await fetch(siteConfig.leadWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...leadData,
            siteName: siteConfig.siteName,
            brokerName: siteConfig.brokerName,
            city: siteConfig.city,
          }),
        });
        if (!webhookResponse.ok) {
          console.error(
            "Webhook respondió error:",
            webhookResponse.status,
            webhookResponse.statusText
          );
        }
      } catch (webhookError) {
        console.error("Error llamando al webhook:", webhookError);
      }
    }

    return res.status(200).json({
      ok: true,
      message: "Lead recibido correctamente",
    });
  } catch (error) {
    console.error("Error en endpoint de contacto:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
}
