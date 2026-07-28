import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/utils/adminAuth";
import { guardReadOnly } from "@/utils/adminReadOnly";
import { saveImage } from "@/utils/storage";
import formidable from "formidable";
import fs from "fs";
import path from "path";

// Disable the automatic body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

interface UploadResponse {
  ok: boolean;
  message?: string;
  url?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {
  // Check authentication
  if (!requireAuth(req, res)) {
    return;
  }
  if (guardReadOnly(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "Method not allowed",
    });
  }

  try {
    // formidable needs a writable dir to buffer the incoming file. `/tmp`
    // works on every platform we care about (local + Netlify Lambda).
    const tmpDir = path.join("/tmp", "uploads");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const form = formidable({
      uploadDir: tmpDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      multiples: false,
    });

    const [, files] = await form.parse(req);

    const fileArray = Array.isArray(files.image) ? files.image : files.image ? [files.image] : [];
    const file = fileArray[0];

    if (!file) {
      return res.status(400).json({
        ok: false,
        message: "No file was provided",
      });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!file.mimetype || !allowedTypes.includes(file.mimetype)) {
      if (fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath);
      return res.status(400).json({
        ok: false,
        message: "File type not allowed. Only images are allowed (JPG, PNG, WEBP, GIF, SVG)",
      });
    }

    // Build a unique, URL-safe filename
    const timestamp = Date.now();
    const originalName = file.originalFilename || "image";
    const extension = path.extname(originalName) || ".jpg";
    const baseName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9]/g, "-");
    const newFileName = `${baseName}-${timestamp}${extension}`;

    // Read the buffered upload and hand it to the storage layer, which
    // picks Blobs (Netlify) or public/images (local dev) transparently.
    const bytes = fs.readFileSync(file.filepath);
    fs.unlinkSync(file.filepath);

    const saved = await saveImage(newFileName, bytes, file.mimetype);

    return res.status(200).json({
      ok: true,
      message: "Image uploaded successfully",
      url: saved.url,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    // Surface the real error message so Netlify-side issues (missing Blobs
    // context, etc.) are diagnosable from the admin UI instead of the
    // function logs. Prefix so operators know where to look.
    const detail = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      ok: false,
      message: `Error uploading the image: ${detail}`,
    });
  }
}
