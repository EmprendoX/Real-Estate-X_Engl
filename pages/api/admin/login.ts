import type { NextApiRequest, NextApiResponse } from "next";
import { createPagesSupabaseClient } from "@/lib/supabase/pagesAuth";

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
    const { data: signIn, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error || !signIn.user) {
      return res.status(401).json({ ok: false, message: "Credenciales inválidas" });
    }

    // Reuse the SAME supabase client that just authenticated to validate
    // scope. Creating a fresh client here would try to read cookies from
    // the request — but the cookies just set live in the response, not the
    // request, so a fresh client sees an anonymous session and rejects.
    const userId = signIn.user.id;
    const clientId = process.env.CLIENT_ID;

    if (!clientId) {
      await supabase.auth.signOut();
      return res.status(403).json({
        ok: false,
        message: "Este sitio no tiene CLIENT_ID configurado — contactá al equipo RealEX",
      });
    }

    const [{ data: role }, { data: cliente }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
      supabase.from("clientes").select("id").eq("user_id", userId).maybeSingle(),
    ]);

    if (!role || (role.role !== "broker" && role.role !== "operator") || !cliente) {
      await supabase.auth.signOut();
      return res.status(403).json({
        ok: false,
        message: "Tu usuario no está autorizado para administrar este sitio",
      });
    }

    if (role.role === "broker") {
      const { data: sitio } = await supabase
        .from("sitios")
        .select("id")
        .eq("cliente_id", cliente.id)
        .eq("id", clientId)
        .maybeSingle();
      if (!sitio) {
        await supabase.auth.signOut();
        return res.status(403).json({
          ok: false,
          message: "Tu usuario está vinculado a otro sitio, no a este",
        });
      }
    }

    return res.status(200).json({ ok: true, message: "Login exitoso" });
  } catch (err) {
    console.error("[login] error:", err);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
}
