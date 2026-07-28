import type { NextApiRequest, NextApiResponse } from "next";
import { requireBroker } from "@/utils/adminAuth";
import { createPagesSupabaseClient } from "@/lib/supabase/pagesAuth";
import { getEffectiveProperties } from "@/utils/storage";
import { savePropertiesToSupabase, triggerBuildAfterSave } from "@/lib/supabase/writeSitio";
import { Property, MAX_PROPERTIES } from "@/data/properties";

interface PropertiesResponse {
  ok: boolean;
  message?: string;
  properties?: Property[];
  property?: Property;
  count?: number;
  rebuild?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PropertiesResponse>,
) {
  const session = await requireBroker(req, res);
  if (!session) return;

  const properties = await getEffectiveProperties();

  if (req.method === "GET") {
    return res.status(200).json({ ok: true, properties, count: properties.length });
  }

  if (req.method === "POST") {
    try {
      if (properties.length >= MAX_PROPERTIES) {
        return res.status(400).json({
          ok: false,
          message: `No podés agregar más de ${MAX_PROPERTIES} propiedades. Actualmente tenés ${properties.length}.`,
        });
      }
      const newProperty: Property = req.body;
      if (!newProperty.title || !newProperty.slug || !newProperty.description) {
        return res.status(400).json({ ok: false, message: "Faltan campos (título, slug, descripción)" });
      }
      if (properties.some((p) => p.slug === newProperty.slug)) {
        return res.status(400).json({ ok: false, message: "Ya existe una propiedad con ese slug" });
      }
      if (properties.some((p) => p.id === newProperty.id)) {
        return res.status(400).json({ ok: false, message: "Ya existe una propiedad con ese ID" });
      }
      if (!["venta", "renta"].includes(newProperty.type)) {
        return res.status(400).json({ ok: false, message: "Tipo debe ser 'venta' o 'renta'" });
      }
      if (!["MXN", "USD"].includes(newProperty.currency)) {
        return res.status(400).json({ ok: false, message: "Currency debe ser MXN o USD" });
      }
      if (
        typeof newProperty.price !== "number" ||
        typeof newProperty.bedrooms !== "number" ||
        typeof newProperty.bathrooms !== "number" ||
        typeof newProperty.parking !== "number" ||
        typeof newProperty.area !== "number"
      ) {
        return res.status(400).json({ ok: false, message: "Los campos numéricos deben ser válidos" });
      }

      const updatedProperties = [...properties, newProperty];
      const supabase = createPagesSupabaseClient(req, res);
      const { buildHookUrl } = await savePropertiesToSupabase(supabase, session.clienteId, updatedProperties);
      const { triggered } = await triggerBuildAfterSave(buildHookUrl);

      return res.status(200).json({
        ok: true,
        message: triggered
          ? "Creada. Online en 2-3 minutos."
          : "Creada. Contactá al equipo RealEX para publicar (falta build hook).",
        property: newProperty,
        count: updatedProperties.length,
        rebuild: triggered,
      });
    } catch (err) {
      console.error("Error creating property:", err);
      return res.status(500).json({
        ok: false,
        message: err instanceof Error ? err.message : "Error al crear",
      });
    }
  }

  return res.status(405).json({ ok: false, message: "Method not allowed" });
}
