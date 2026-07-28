/**
 * Admin auth for /admin.
 *
 * Historia: originalmente era un password compartido (ADMIN_PASSWORD env).
 * Ahora: Supabase Auth — cada broker se loggea con su email/password (creado
 * por el operador en el dashboard RealEX). El JWT vive en cookies gestionadas
 * por @supabase/ssr, así el mismo cookie lo usan el /admin del site y las
 * RLS policies de Supabase.
 *
 * Retro-compat: si CLIENT_ID no está seteado (dev local, showcase rexais),
 * NO se puede usar el /admin — porque no hay Supabase para autenticar. En
 * ese caso los mutation handlers rechazan con un mensaje explícito.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { createPagesSupabaseClient } from "@/lib/supabase/pagesAuth";

export interface BrokerSession {
  userId: string;
  email: string;
  clienteId: string;
}

export async function getBrokerSession(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<BrokerSession | null> {
  try {
    const supabase = createPagesSupabaseClient(req, res);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // Verify the user has role='broker' and is linked to the same cliente
    // whose CLIENT_ID this deployment is serving.
    const clientId = process.env.CLIENT_ID;
    if (!clientId) return null;

    const [{ data: role }, { data: cliente }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
      supabase.from("clientes").select("id").eq("user_id", user.id).maybeSingle(),
    ]);

    if (!role) return null;
    if (role.role !== "broker" && role.role !== "operator") return null;
    if (!cliente) return null;

    // For brokers: enforce that their linked cliente owns THIS deployment's sitio.
    if (role.role === "broker") {
      const { data: sitio } = await supabase
        .from("sitios")
        .select("id")
        .eq("cliente_id", cliente.id)
        .eq("id", clientId)
        .maybeSingle();
      if (!sitio) return null;
    }

    return { userId: user.id, email: user.email ?? "", clienteId: cliente.id };
  } catch (err) {
    console.error("[adminAuth] getBrokerSession error:", err);
    return null;
  }
}

/** Sync helper for existing routes to short-circuit with 401. */
export async function requireBroker(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<BrokerSession | null> {
  const session = await getBrokerSession(req, res);
  if (!session) {
    res.status(401).json({ ok: false, message: "No autorizado" });
    return null;
  }
  return session;
}

/**
 * @deprecated Kept as a NO-OP wrapper for legacy call sites. Real check is
 * now `requireBroker`. Returns true only if a valid broker session exists.
 */
export async function requireAuthAsync(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<boolean> {
  const session = await getBrokerSession(req, res);
  if (!session) {
    res.status(401).json({ ok: false, message: "No autorizado" });
    return false;
  }
  return true;
}

/**
 * @deprecated Legacy sync signature — old code called `requireAuth(req, res)`
 * expecting a boolean. Since Supabase auth is async, callers must migrate to
 * `requireBroker`. This is provided so build doesn't break during migration.
 */
export function requireAuth(_req: NextApiRequest, res: NextApiResponse): boolean {
  res.status(500).json({
    ok: false,
    message: "requireAuth (sync) está obsoleto — usar requireBroker (async).",
  });
  return false;
}

export function checkAuth(_req: NextApiRequest): boolean {
  return false; // legacy sync — always false; use getBrokerSession
}
