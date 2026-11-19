"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/app/lib/connection/db";
import { getAdmin } from "@/app/lib/admin/adminAuth";
import Application from "@/app/models/Application";

const ALLOWED = ["pending", "shortlisted", "approved", "rejected"];

export async function setStatus(formData) {
  const admin = await getAdmin(); // bina admin login ke kuch nahi hoga
  if (!admin) return;

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!mongoose.isValidObjectId(id) || !ALLOWED.includes(status)) return;

  await connectDB();

  const app = await Application.findById(id).select("payment.status").lean();
  if (!app) return;

  // Paid application ka status badalna allowed nahi
  if (app.payment?.status === "paid" && status !== "approved") return;

  const update = { $set: { status } };
  // Approved se hatao to booth + pending payment release kar do
  if (status !== "approved") update.$unset = { location: "", payment: "" };

  await Application.updateOne({ _id: id }, update);

  revalidatePath("/admin/dashboard", "layout");
}