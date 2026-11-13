export const MAX_IMAGES = 5;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB per image
export const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB catalogue

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\-\s\d]{7,20}$/;

const isFile = (v) => v && typeof v === "object" && typeof v.arrayBuffer === "function";

// Real file signature check (the browser's "type" can be faked)
const isPdf = (buf) => buf.length > 5 && buf.subarray(0, 5).toString("latin1") === "%PDF-";

function isImage(buf) {
  if (buf.length < 12) return false;
  // JPG
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  // PNG
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return true;
  // WebP
  if (
    buf.subarray(0, 4).toString("latin1") === "RIFF" &&
    buf.subarray(8, 12).toString("latin1") === "WEBP"
  )
    return true;
  return false;
}

export async function validateApplication(fd) {
  const errors = {};
  const s = (k) => String(fd.get(k) ?? "").trim();

  const values = {
    name: s("name"),
    email: s("email").toLowerCase(),
    phone: s("phone"),
    brand: s("brand"),
    website: s("website"),
    message: s("message"),
  };

  /* ---------- text fields ---------- */
  if (values.name.length < 2 || values.name.length > 100)
    errors.name = "Please enter your full name.";

  if (!EMAIL_RE.test(values.email) || values.email.length > 254)
    errors.email = "Please enter a valid email address.";

  const digits = values.phone.replace(/\D/g, "");
  if (!PHONE_RE.test(values.phone) || digits.length < 8 || digits.length > 15)
    errors.phone = "Please enter a valid phone number.";

  if (!values.brand || values.brand.length > 120)
    errors.brand = "Please enter your brand name.";

  if (values.website.length > 200) errors.website = "Website / Instagram is too long.";
  if (values.message.length > 2000) errors.message = "Message is too long (max 2000 characters).";

  /* ---------- catalogue (PDF) ---------- */
  const files = { catalogue: null, images: [] };

  const cat = fd.get("catalogue");
  if (!isFile(cat) || cat.size === 0) {
    errors.catalogue = "Please upload your catalogue (PDF).";
  } else if (cat.size > MAX_PDF_BYTES) {
    errors.catalogue = `Catalogue is too large (${(cat.size / 1024 / 1024).toFixed(1)} MB). Only PDF files up to ${MAX_PDF_BYTES / 1024 / 1024} MB are allowed.`;
  } else {
    const buffer = Buffer.from(await cat.arrayBuffer());
    if (!isPdf(buffer)) errors.catalogue = "Catalogue must be a valid PDF file.";
    else files.catalogue = { buffer, name: cat.name || "catalogue.pdf", size: cat.size };
  }

  /* ---------- images ---------- */
  const imgs = fd.getAll("images").filter((f) => isFile(f) && f.size > 0);

  if (imgs.length < 1) {
    errors.images = "Please upload at least one image.";
  } else if (imgs.length > MAX_IMAGES) {
    errors.images = `You can upload a maximum of ${MAX_IMAGES} images.`;
  } else {
    for (const f of imgs) {
      if (f.size > MAX_IMAGE_BYTES) {
        errors.images = `"${f.name}" is too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Each image can be up to ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`;
        break;
      }
      const buffer = Buffer.from(await f.arrayBuffer());
      if (!isImage(buffer)) {
        errors.images = "Only JPG, PNG or WebP images are allowed.";
        break;
      }
      files.images.push({ buffer, name: f.name || "image", size: f.size });
    }
  }

  return { errors, values, files };
}