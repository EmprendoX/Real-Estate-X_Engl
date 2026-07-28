import type { NextApiRequest, NextApiResponse } from "next";
import { createPagesSupabaseClient } from "@/lib/supabase/pagesAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ok: boolean }>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }
  try {
    const supabase = createPagesSupabaseClient(req, res);
    await supabase.auth.signOut();
  } catch (err) {
    console.error("[logout] error:", err);
  }
  return res.status(200).json({ ok: true });
}
