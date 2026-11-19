import { NextResponse } from "next/server";
import { connectDB } from "../lib/connection/db";
import Enquiry from "../models/Enquiry";

// POST: enquiry save karo
export async function createEnquiry(req) {
  try {
    const { name, phone, email, message } = await req.json();

    if (!name || !phone || !email || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email." },
        { status: 400 }
      );
    }

    await connectDB();
    const enquiry = await Enquiry.create({ name, phone, email, message });

    return NextResponse.json(
      { success: true, message: "Enquiry submitted successfully.", data: enquiry },
      { status: 201 }
    );
  } catch (error) {
    console.error("createEnquiry error:", error);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}

// GET: saari enquiries (admin ke liye)
export async function getEnquiries() {
  try {
    await connectDB();
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: enquiries });
  } catch (error) {
    console.error("getEnquiries error:", error);
    return NextResponse.json(
      { success: false, message: "Server error." },
      { status: 500 }
    );
  }
}