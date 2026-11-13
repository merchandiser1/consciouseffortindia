"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/app/lib/connection/db";
import { getAdmin } from "@/app/lib/admin/adminAuth";
import Application from "@/app/models/Application";

const ALLOWED = ["pending", "approved", "rejected"];

export async function setStatus(formData) {
  const admin = await getAdmin(); // bina admin login ke kuch nahi hoga
  if (!admin) return;

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!mongoose.isValidObjectId(id) || !ALLOWED.includes(status)) return;

  await connectDB();
  await Application.updateOne({ _id: id }, { $set: { status } });

  revalidatePath("/admin/dashboard", "layout");
}