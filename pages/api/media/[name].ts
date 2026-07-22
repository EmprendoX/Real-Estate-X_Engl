import type { NextApiRequest, NextApiResponse } from "next";
import { readImage } from "@/utils/storage";

// Serves images stored in Netlify Blobs. In local dev, images live under
// public/images and Next.js serves them directly — this route is only hit on
// Netlify, where the storage layer wrote them to Blobs.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  const { name } = req.query;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ ok: false, message: "Missing image name" });
  }

  const image = await readImage(name);
  if (!image) {
    return res.status(404).json({ ok: false, message: "Image not found" });
  }

  res.setHeader("Content-Type", image.contentType);
  res.setHeader(
    "Cache-Control",
    "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
  );
  return res.status(200).send(Buffer.from(image.bytes));
}
