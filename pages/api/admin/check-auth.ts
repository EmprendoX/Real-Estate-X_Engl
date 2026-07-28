import type { NextApiRequest, NextApiResponse } from "next";
import { checkAuth } from "@/utils/adminAuth";
import { isAdminReadOnly } from "@/utils/adminReadOnly";

interface AuthCheckResponse {
  ok: boolean;
  authenticated: boolean;
  readOnly: boolean;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthCheckResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      authenticated: false,
      readOnly: false,
    });
  }

  const authenticated = checkAuth(req);
  return res.status(200).json({
    ok: true,
    authenticated,
    readOnly: isAdminReadOnly(),
  });
}
