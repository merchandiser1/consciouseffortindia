import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/connection/db";
import { fail, serverError, getAuthUser } from "@/app/lib/auth/authHelpers";
import { COOKIE_NAME } from "@/app/lib/auth/jwt"; // apni jwt file ka sahi path
import { BOOTHS, getBooth, priceBreakup } from "@/app/lib/booths";
import Application from "@/app/models/Application";

// Logged-in user ki applications: userId se ya email se
const ownerFilter = (user) => {
  const or = [];
  if (user.id && mongoose.isValidObjectId(user.id)) or.push({ userId: user.id });
  if (user.email) or.push({ email: String(user.email).toLowerCase() });
  return or;
};

/* ---------- GET: applications + booths + stock ---------- */
export async function getDashboard() {
  try {
    const user = await getAuthUser().catch(() => null);
    if (!user) return fail("Unauthorized", 401);

    const or = ownerFilter(user);
    if (!or.length) return fail("Unauthorized", 401);

    await connectDB();

    const apps = await Application.find({ $or: or }).sort({ createdAt: -1 }).lean();

    // Har event ki kaunsi booth kitni baar li gayi
    const titles = [...new Set(apps.map((a) => a.eventTitle).filter(Boolean))];
    const agg = titles.length
      ? await Application.aggregate([
          { $match: { eventTitle: { $in: titles }, location: { $nin: [null, ""] } } },
          { $group: { _id: { e: "$eventTitle", l: "$location" }, n: { $sum: 1 } } },
        ])
      : [];

    const taken = {};
    for (const r of agg) {
      taken[r._id.e] = taken[r._id.e] || {};
      taken[r._id.e][r._id.l] = r.n;
    }

    return NextResponse.json({
      user: {
        username: user.username || user.name || String(user.email || "user").split("@")[0],
        email: user.email || "",
      },
      applications: JSON.parse(JSON.stringify(apps)),
      booths: BOOTHS.map((b) => ({ ...b, ...priceBreakup(b) })),
      taken,
    });
  } catch (err) {
    console.error("[dashboard:get]", err);
    return serverError();
  }
}

/* ---------- PATCH: booth select / change booth / pay ---------- */
export async function updateDashboard(req) {
  try {
    const user = await getAuthUser().catch(() => null);
    if (!user) return fail("Unauthorized", 401);

    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid request", 400);

    const { id, action, location, method } = body;

    const or = ownerFilter(user);
    if (!or.length || !mongoose.isValidObjectId(id)) return fail("Application not found", 404);

    await connectDB();

    const app = await Application.findOne({ _id: id, $or: or }).lean();
    if (!app) return fail("Application not found", 404);
    if (app.status !== "approved") return fail("Application is not approved yet", 400);
    if (app.payment?.status === "paid") return fail("Already paid", 400);

    /* --- booth select --- */
    if (action === "location") {
      const booth = getBooth(location);
      if (!booth) return fail("Invalid booth", 400);

      const sameBooth = { eventTitle: app.eventTitle, location: booth.name };

      const taken = await Application.countDocuments({ ...sameBooth, _id: { $ne: app._id } });
      if (taken >= booth.stock) return fail(`${booth.name} is sold out`, 409);

      const saved = await Application.findByIdAndUpdate(
        app._id,
        {
          $set: {
            location: booth.name,
            payment: { status: "pending", amount: priceBreakup(booth).total },
          },
        },
        { new: true, lean: true }
      );

      if (!saved || saved.location !== booth.name) {
        console.error("[dashboard] location not persisted. Application model me location/payment check karo");
        return fail("Booth could not be saved", 500);
      }

      // Race condition: dono ne aakhri booth ek saath liya
      const total = await Application.countDocuments(sameBooth);
      if (total > booth.stock) {
        await Application.findByIdAndUpdate(app._id, { $unset: { location: "", payment: "" } });
        return fail(`${booth.name} is sold out`, 409);
      }

      return NextResponse.json({ ok: true, location: saved.location });
    }

    /* --- change booth --- */
    if (action === "reset_location") {
      await Application.findByIdAndUpdate(app._id, { $unset: { location: "", payment: "" } });
      return NextResponse.json({ ok: true });
    }

    /* --- pay --- */
    if (action === "pay") {
      const booth = getBooth(app.location);
      if (!booth) return fail("Select a booth first", 400);
      if (!["upi", "card", "netbanking"].includes(method)) {
        return fail("Invalid payment method", 400);
      }

      const saved = await Application.findByIdAndUpdate(
        app._id,
        {
          $set: {
            payment: {
              status: "paid",
              method,
              amount: priceBreakup(booth).total, // amount hamesha server pe calculate hota hai
              txnId: "TXN" + Date.now() + Math.floor(Math.random() * 1000),
              paidAt: new Date(),
            },
          },
        },
        { new: true, lean: true }
      );

      if (saved?.payment?.status !== "paid") return fail("Payment could not be saved", 500);
      return NextResponse.json({ ok: true });
    }

    return fail("Unknown action", 400);
  } catch (err) {
    console.error("[dashboard:patch]", err);
    return serverError();
  }
}

/* ---------- DELETE: logout ---------- */
export async function logoutDashboard() {
  try {
    const store = await cookies();
    store.delete(COOKIE_NAME);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[dashboard:logout]", err);
    return serverError();
  }
}