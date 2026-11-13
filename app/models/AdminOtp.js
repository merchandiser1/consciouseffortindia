import mongoose from "mongoose";

const AdminOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otpHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  lastSentAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
});

// MongoDB expired OTPs ko khud delete kar dega
AdminOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.AdminOtp || mongoose.model("AdminOtp", AdminOtpSchema);