import type { NextApiRequest, NextApiResponse } from "next";
import { getBrokerSession } from "@/utils/adminAuth";

interface AuthCheckResponse {
  ok: boolean;
  authenticated: boolean;
  email?: string;
  readOnly: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthCheckResponse>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, authenticated: false, readOnly: false });
  }

  const session = await getBrokerSession(req, res);
  const isManaged = !!process.env.CLIENT_ID;

  // Cuando el site NO es managed (dev local, showcase rexais), el /admin no
  // funciona porque no hay Supabase para autenticar. La UI muestra ese estado.
  if (!isManaged) {
    return res.status(200).json({
      ok: true,
      authenticated: false,
      readOnly: true,
    });
  }

  return res.status(200).json({
    ok: true,
    authenticated: !!session,
    email: session?.email,
    readOnly: false,
  });
}
