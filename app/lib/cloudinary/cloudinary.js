import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "node:crypto";

let configured = false;

function configure() {
  if (configured) return;

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      "Cloudinary env missing: set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
    );
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

/**
 * Upload one file buffer to Cloudinary.
 * kind: "pdf"   -> stored as a "raw" asset (public_id keeps the .pdf extension)
 *       "image" -> stored as an "image" asset
 */
export function uploadBuffer(buffer, { kind }) {
  configure();

  const isPdf = kind === "pdf";
  const id = randomUUID();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: isPdf ? `${id}.pdf` : id,
        resource_type: isPdf ? "raw" : "image",
        overwrite: false,
      },
      (err, result) => {
        if (err || !result) return reject(err || new Error("Cloudinary upload failed"));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type, // "image" | "raw"
          bytes: result.bytes,
        });
      }
    );
    stream.end(buffer);
  });
}

/** Delete already uploaded assets (used for cleanup when something fails). Never throws. */
export async function deleteAssets(assets = []) {
  if (!assets.length) return;
  try {
    configure();
    await Promise.allSettled(
      assets.map((a) =>
        cloudinary.uploader.destroy(a.publicId, { resource_type: a.resourceType })
      )
    );
  } catch (err) {
    console.error("[cloudinary] cleanup failed:", err.message);
  }
}