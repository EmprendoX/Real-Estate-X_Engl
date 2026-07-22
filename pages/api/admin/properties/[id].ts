import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/utils/adminAuth";
import { getEffectiveProperties, saveProperties } from "@/utils/storage";
import { Property } from "@/data/properties";

interface PropertyResponse {
  ok: boolean;
  message?: string;
  property?: Property;
  count?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PropertyResponse>
) {
  // Check authentication
  if (!requireAuth(req, res)) {
    return;
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      ok: false,
      message: "Property ID required",
    });
  }

  const properties = await getEffectiveProperties();

  // PUT - Update property
  if (req.method === "PUT") {
    try {
      const updatedProperty: Property = req.body;

      if (updatedProperty.id !== id) {
        return res.status(400).json({
          ok: false,
          message: "The property ID does not match",
        });
      }

      const propertyIndex = properties.findIndex((p) => p.id === id);
      if (propertyIndex === -1) {
        return res.status(404).json({
          ok: false,
          message: "Property not found",
        });
      }

      if (
        updatedProperty.slug !== properties[propertyIndex].slug &&
        properties.some((p) => p.slug === updatedProperty.slug && p.id !== id)
      ) {
        return res.status(400).json({
          ok: false,
          message: "Another property with that slug already exists",
        });
      }

      if (!updatedProperty.title || !updatedProperty.slug || !updatedProperty.description) {
        return res.status(400).json({
          ok: false,
          message: "Missing required fields",
        });
      }

      if (!["venta", "renta"].includes(updatedProperty.type)) {
        return res.status(400).json({
          ok: false,
          message: "Type must be 'venta' or 'renta'",
        });
      }

      if (!["MXN", "USD"].includes(updatedProperty.currency)) {
        return res.status(400).json({
          ok: false,
          message: "Currency must be 'MXN' or 'USD'",
        });
      }

      const updatedProperties = [...properties];
      updatedProperties[propertyIndex] = updatedProperty;
      await saveProperties(updatedProperties);

      return res.status(200).json({
        ok: true,
        message: "Property updated successfully",
        property: updatedProperty,
        count: updatedProperties.length,
      });
    } catch (error) {
      console.error("Error updating property:", error);
      return res.status(500).json({
        ok: false,
        message: "Error updating the property",
      });
    }
  }

  // DELETE - Delete property
  if (req.method === "DELETE") {
    try {
      const propertyIndex = properties.findIndex((p) => p.id === id);
      if (propertyIndex === -1) {
        return res.status(404).json({
          ok: false,
          message: "Property not found",
        });
      }

      const updatedProperties = properties.filter((p) => p.id !== id);
      await saveProperties(updatedProperties);

      return res.status(200).json({
        ok: true,
        message: "Property deleted successfully",
        count: updatedProperties.length,
      });
    } catch (error) {
      console.error("Error deleting property:", error);
      return res.status(500).json({
        ok: false,
        message: "Error deleting the property",
      });
    }
  }

  return res.status(405).json({
    ok: false,
    message: "Method not allowed",
  });
}
