/**
 * When this site is deployed as a managed RealEX client site (CLIENT_ID is set
 * on the Netlify env), the in-repo admin panel becomes read-only. All content
 * mutations must go through the RealEX dashboard so there is a single source
 * of truth for `sitios.config` in Supabase.
 */

import type { NextApiRequest, NextApiResponse } from "next";

export function isAdminReadOnly(): boolean {
  return !!process.env.CLIENT_ID;
}

/**
 * Short-circuit a mutation API handler with 403 when the site is in read-only
 * mode. Safe methods (GET/HEAD/OPTIONS) pass through untouched. Returns true
 * if the response was already sent — caller must return immediately.
 */
export function guardReadOnly(
  req: NextApiRequest,
  res: NextApiResponse,
): boolean {
  if (!isAdminReadOnly()) return false;
  const method = (req.method || "GET").toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return false;
  res.status(403).json({
    ok: false,
    message:
      "Panel en modo solo lectura. Este sitio se administra desde el dashboard RealEX.",
  });
  return true;
}
