import type { NextApiRequest, NextApiResponse } from "next";
import { requireBroker } from "@/utils/adminAuth";
import { createPagesSupabaseClient } from "@/lib/supabase/pagesAuth";
import { savePropertiesToSupabase, triggerBuildAfterSave } from "@/lib/supabase/writeSitio";
import { Property, MAX_PROPERTIES } from "@/data/properties";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Read the CURRENT properties list from Supabase for this broker's sitio,
 * bypassing the module-level cache in getEffectiveProperties (which is for
 * build-time reads and stays stale across sequential admin mutations).
 */
async function readPropertiesFresh(
  supabase: SupabaseClient,
  clienteId: string,
): Promise<Property[]> {
  const { data } = await supabase
    .from("sitios")
    .select("config")
    .eq("cliente_id", clienteId)
    .maybeSingle();
  const cfg = (data?.config ?? {}) as { properties?: Property[] };
  return Array.isArray(cfg.properties) ? cfg.properties : [];
}

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

  const supabase = createPagesSupabaseClient(req, res);
  const properties = await readPropertiesFresh(supabase, session.clienteId);

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
