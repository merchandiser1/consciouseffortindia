import { connectDB } from "@/app/lib/connection/db";
import {
  ok, fail, serverError, tooMany, getClientIp, rateLimit, getAuthUser,
} from "@/app/lib/auth/authHelpers";
import { validateApplication } from "@/app/lib/application/applicationValidation";
import { uploadBuffer, deleteAssets } from "@/app/lib/cloudinary/cloudinary";
import Application from "@/app/models/Application";

const MIN = 60 * 1000;
const EVENT_TITLE = "#ConsciousEffort India, Hyderabad";

export async function submitApplication(req) {
  let uploaded = []; // remembered so we can delete them if anything fails

  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`apply:${ip}`, 10, 60 * MIN);
    if (!rl.allowed) return tooMany(rl.retryAfter);

    let formData;
    try {
      formData = await req.formData();
    } catch {
      return fail("Invalid form submission. Please try again.", 400);
    }

    const { errors, values, files } = await validateApplication(formData);
    if (Object.keys(errors).length) {
      return fail(Object.values(errors)[0], 400, { errors });
    }

    await connectDB();

    // Logged-in applicants get linked to their account (public apply still works)
    const authUser = await getAuthUser().catch(() => null);

    // Upload the PDF + all images at the same time
    const jobs = [
      uploadBuffer(files.catalogue.buffer, { kind: "pdf" }),
      ...files.images.map((img) =>
        uploadBuffer(img.buffer, { kind: "image" })
      ),
    ];
    const results = await Promise.allSettled(jobs);

    uploaded = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
    if (results.some((r) => r.status === "rejected")) {
      const bad = results.find((r) => r.status === "rejected");
      throw new Error(`upload failed: ${bad.reason?.message || bad.reason}`);
    }

    const [cat, ...imgs] = uploaded;

    const doc = await Application.create({
      userId: authUser?.id || null,
      eventTitle: EVENT_TITLE,
      ...values,
      catalogueUrl: cat.url,
      imageUrls: imgs.map((img) => img.url),
      status: "pending", // always starts as pending; only admin can change it later
      ip,
    });

    return ok(
      "Your application has been submitted. We will review it and respond shortly.",
      { id: String(doc._id), status: doc.status },
      201
    );
  } catch (err) {
    console.error("[application]", err);
    await deleteAssets(uploaded); // don't leave orphan files in Cloudinary
    return serverError();
  }
}