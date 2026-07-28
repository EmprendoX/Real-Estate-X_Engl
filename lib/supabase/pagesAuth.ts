/**
 * Supabase Auth client for Pages Router API handlers.
 *
 * Uses @supabase/ssr with a manual cookie adapter that bridges Next's
 * NextApiRequest/NextApiResponse (Pages Router) to the cookie contract
 * that @supabase/ssr expects.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextApiRequest, NextApiResponse } from "next";

export function createPagesSupabaseClient(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Supabase env vars faltantes: SUPABASE_URL / SUPABASE_ANON_KEY (o sus NEXT_PUBLIC_ equivalents)",
    );
  }

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        const raw = req.cookies || {};
        return Object.entries(raw).map(([name, value]) => ({
          name,
          value: value as string,
        }));
      },
      setAll(cookiesToSet) {
        const serialized = cookiesToSet.map(
          ({ name, value, options }: { name: string; value: string; options: CookieOptions }) =>
            serializeCookie(name, value, options),
        );
        // Preserve any existing Set-Cookie headers.
        const existing = res.getHeader("Set-Cookie");
        const existingArr = Array.isArray(existing)
          ? existing
          : existing != null
            ? [String(existing)]
            : [];
        res.setHeader("Set-Cookie", [...existingArr, ...serialized]);
      },
    },
  });
}

// Minimal cookie serializer (kept dependency-free — Next has 'cookie' as
// a transitive dep already).
function serializeCookie(name: string, value: string, opts: CookieOptions): string {
  const parts: string[] = [`${name}=${encodeURIComponent(value)}`];
  if (opts.maxAge != null) parts.push(`Max-Age=${Math.floor(opts.maxAge)}`);
  if (opts.expires) parts.push(`Expires=${opts.expires.toUTCString()}`);
  if (opts.path) parts.push(`Path=${opts.path}`);
  if (opts.domain) parts.push(`Domain=${opts.domain}`);
  if (opts.sameSite) {
    const ss = String(opts.sameSite);
    parts.push(`SameSite=${ss.charAt(0).toUpperCase()}${ss.slice(1)}`);
  }
  if (opts.secure) parts.push("Secure");
  if (opts.httpOnly) parts.push("HttpOnly");
  return parts.join("; ");
}
