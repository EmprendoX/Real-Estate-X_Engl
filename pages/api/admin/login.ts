import type { NextApiRequest, NextApiResponse } from "next";
import { createPagesSupabaseClient } from "@/lib/supabase/pagesAuth";
import { getBrokerSession } from "@/utils/adminAuth";

interface LoginResponse {
  ok: boolean;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const { email, password } = (req.body ?? {}) as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ ok: false, message: "Email y contraseña requeridos" });
  }

  try {
    const supabase = createPagesSupabaseClient(req, res);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      return res.status(401).json({ ok: false, message: "Credenciales inválidas" });
    }

    // Verify the newly-authed user is actually the broker for THIS site.
    const session = await getBrokerSession(req, res);
    if (!session) {
      // Auth succeeded but they're not linked to this cliente / site.
      await supabase.auth.signOut();
      return res.status(403).json({
        ok: false,
        message: "Tu usuario no está autorizado para administrar este sitio",
      });
    }

    return res.status(200).json({ ok: true, message: "Login exitoso" });
  } catch (err) {
    console.error("[login] error:", err);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
}
