import mongoose from "mongoose";

const PasswordResetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true, lowercase: true },
    otpHash: { type: String, default: null },        // null after successful verification (single-use)
    purpose: { type: String, default: "password_reset" },
    expiresAt: { type: Date, required: true },        // OTP expiry, extended to reset-token expiry after verify
    resendAvailableAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    verifiedAt: { type: Date, default: null },
    resetTokenHash: { type: String, default: null },
    resetTokenExpiresAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// one active record per user + purpose
PasswordResetSchema.index({ userId: 1, purpose: 1 }, { unique: true });
// MongoDB auto-deletes the document once expiresAt passes
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.PasswordReset || mongoose.model("PasswordReset", PasswordResetSchema);
