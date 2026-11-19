import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAdmin } from "@/app/lib/admin/adminAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Sirf apne Cloudinary cloud ke URL allow (SSRF se bachne ke liye)
function parseCloudinaryUrl(src) {
  let u;
  try {
    u = new URL(src);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || u.hostname !== "res.cloudinary.com") return null;

  const m = u.pathname.match(/^\/([^/]+)\/(raw|image)\/upload\/(?:v\d+\/)?(.+)$/);
  if (!m || m[1] !== process.env.CLOUDINARY_CLOUD_NAME) return null;

  return { resourceType: m[2], publicId: decodeURIComponent(m[3]) };
}

function configure() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function GET(req) {
  try {
    const admin = await getAdmin();
    if (!admin) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const src = searchParams.get("url") || "";
    const download = searchParams.get("download") === "1";

    const info = parseCloudinaryUrl(src);
    if (!info) return new NextResponse("Invalid catalogue URL", { status: 400 });

    // 1) direct fetch
    let upstream = await fetch(src, { cache: "no-store" });

    // 2) Cloudinary PDF delivery block ho (401/404) to signed download URL se try karo
    if (!upstream.ok) {
      configure();
      const signed = cloudinary.utils.private_download_url(info.publicId, "", {
        resource_type: info.resourceType,
        type: "upload",
        attachment: false,
        expires_at: Math.floor(Date.now() / 1000) + 300,
      });
      upstream = await fetch(signed, { cache: "no-store" });
    }

    if (!upstream.ok || !upstream.body) {
      console.error("[admin:catalogue] upstream failed", upstream.status);
      return new NextResponse("Catalogue not available", { status: 502 });
    }

    const base = info.publicId.split("/").pop().replace(/\.pdf$/i, "").slice(0, 8);
    const filename = `catalogue-${base}.pdf`;

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[admin:catalogue]", err);
    return new NextResponse("Server error", { status: 500 });
  }
}