import type { NextApiRequest, NextApiResponse } from "next";
import { requireBroker } from "@/utils/adminAuth";
import { createPagesSupabaseClient } from "@/lib/supabase/pagesAuth";
import { uploadImageToSupabase } from "@/lib/supabase/writeSitio";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: { bodyParser: false },
};

interface UploadResponse {
  ok: boolean;
  message?: string;
  url?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>,
) {
  const session = await requireBroker(req, res);
  if (!session) return;

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const tmpDir = path.join("/tmp", "uploads");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const form = formidable({
      uploadDir: tmpDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024,
      multiples: false,
    });

    const [, files] = await form.parse(req);
    const fileArray = Array.isArray(files.image) ? files.image : files.image ? [files.image] : [];
    const file = fileArray[0];

    if (!file) return res.status(400).json({ ok: false, message: "No se envió archivo" });

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!file.mimetype || !allowedTypes.includes(file.mimetype)) {
      if (fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath);
      return res.status(400).json({
        ok: false,
        message: "Formato no permitido. Solo JPG, PNG, WEBP, GIF.",
      });
    }

    const timestamp = Date.now();
    const originalName = file.originalFilename || "image";
    const extension = path.extname(originalName) || ".jpg";
    const baseName = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase()
      .slice(0, 40);
    const newFileName = `${baseName || "img"}-${timestamp}${extension}`;

    const bytes = fs.readFileSync(file.filepath);
    fs.unlinkSync(file.filepath);

    const supabase = createPagesSupabaseClient(req, res);
    const { url } = await uploadImageToSupabase(
      supabase,
      session.clienteId,
      newFileName,
      bytes,
      file.mimetype,
    );

    return res.status(200).json({ ok: true, message: "Imagen subida", url });
  } catch (error) {
    console.error("Error uploading image:", error);
    const detail = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ ok: false, message: `Error al subir: ${detail}` });
  }
}
