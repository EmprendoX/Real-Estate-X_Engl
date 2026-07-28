import type { NextApiRequest, NextApiResponse } from "next";
import { requireBroker } from "@/utils/adminAuth";
import { createPagesSupabaseClient } from "@/lib/supabase/pagesAuth";
import { savePropertiesToSupabase, triggerBuildAfterSave } from "@/lib/supabase/writeSitio";
import { Property } from "@/data/properties";
import type { SupabaseClient } from "@supabase/supabase-js";

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

interface PropertyResponse {
  ok: boolean;
  message?: string;
  property?: Property;
  count?: number;
  rebuild?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PropertyResponse>,
) {
  const session = await requireBroker(req, res);
  if (!session) return;

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ ok: false, message: "Property ID required" });
  }

  const supabase = createPagesSupabaseClient(req, res);
  const properties = await readPropertiesFresh(supabase, session.clienteId);

  if (req.method === "PUT") {
    try {
      const updatedProperty: Property = req.body;
      if (updatedProperty.id !== id) {
        return res.status(400).json({ ok: false, message: "El ID de la propiedad no coincide" });
      }
      const propertyIndex = properties.findIndex((p) => p.id === id);
      if (propertyIndex === -1) {
        return res.status(404).json({ ok: false, message: "Propiedad no encontrada" });
      }
      if (
        updatedProperty.slug !== properties[propertyIndex].slug &&
        properties.some((p) => p.slug === updatedProperty.slug && p.id !== id)
      ) {
        return res.status(400).json({ ok: false, message: "Otra propiedad tiene ese slug" });
      }
      if (!updatedProperty.title || !updatedProperty.slug || !updatedProperty.description) {
        return res.status(400).json({ ok: false, message: "Faltan campos requeridos" });
      }
      if (!["venta", "renta"].includes(updatedProperty.type)) {
        return res.status(400).json({ ok: false, message: "Tipo inválido" });
      }
      if (!["MXN", "USD"].includes(updatedProperty.currency)) {
        return res.status(400).json({ ok: false, message: "Currency inválido" });
      }

      const updatedProperties = [...properties];
      updatedProperties[propertyIndex] = updatedProperty;

      const { buildHookUrl } = await savePropertiesToSupabase(supabase, session.clienteId, updatedProperties);
      const { triggered } = await triggerBuildAfterSave(buildHookUrl);

      return res.status(200).json({
        ok: true,
        message: triggered ? "Actualizada. Online en 2-3 minutos." : "Actualizada.",
        property: updatedProperty,
        count: updatedProperties.length,
        rebuild: triggered,
      });
    } catch (err) {
      console.error("Error updating property:", err);
      return res.status(500).json({ ok: false, message: err instanceof Error ? err.message : "Error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const propertyIndex = properties.findIndex((p) => p.id === id);
      if (propertyIndex === -1) {
        return res.status(404).json({ ok: false, message: "Propiedad no encontrada" });
      }
      const updatedProperties = properties.filter((p) => p.id !== id);

      const { buildHookUrl } = await savePropertiesToSupabase(supabase, session.clienteId, updatedProperties);
      const { triggered } = await triggerBuildAfterSave(buildHookUrl);

      return res.status(200).json({
        ok: true,
        message: triggered ? "Eliminada. Online en 2-3 minutos." : "Eliminada.",
        count: updatedProperties.length,
        rebuild: triggered,
      });
    } catch (err) {
      console.error("Error deleting property:", err);
      return res.status(500).json({ ok: false, message: err instanceof Error ? err.message : "Error" });
    }
  }

  return res.status(405).json({ ok: false, message: "Method not allowed" });
}
