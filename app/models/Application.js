import mongoose from "mongoose";

// Reuse this in the admin API / dashboard so the values never get out of sync
export const APPLICATION_STATUSES = ["pending", "approved", "rejected"];
export const PAYMENT_STATUSES = ["pending", "paid"];
export const PAYMENT_METHODS = ["upi", "card", "netbanking"];

const PaymentSchema = new mongoose.Schema(
  {
    status: { type: String, enum: PAYMENT_STATUSES, default: "pending" },
    method: { type: String, enum: PAYMENT_METHODS },
    amount: { type: Number, default: 0 }, // total incl. GST (server calculated)
    txnId: { type: String },
    paidAt: { type: Date },
  },
  { _id: false }
);

const ApplicationSchema = new mongoose.Schema(
  {
    // Set when the applicant was logged in (used for "My Applications")
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },

    eventTitle: { type: String, required: true, trim: true },

    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    brand: { type: String, required: true, trim: true, maxlength: 120 },
    website: { type: String, default: "", trim: true, maxlength: 200 },
    message: { type: String, default: "", trim: true, maxlength: 2000 },

    // Only Cloudinary URLs are stored. The real files live on Cloudinary.
    catalogueUrl: { type: String, required: true, trim: true },
    imageUrls: {
      type: [String],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1 && arr.length <= 5,
        message: "Between 1 and 5 images are required",
      },
    },

    // Default is "pending". Admin changes it later (pending -> approved / rejected)
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "pending",
      index: true,
    },

    // ---- Booth + payment (set after approval) ----
    location: { type: String, trim: true }, // booth name, e.g. "Woodpecker"
    payment: { type: PaymentSchema },

    ip: { type: String, default: "" },
  },
  { timestamps: true }
);

ApplicationSchema.index({ email: 1, eventTitle: 1 });
ApplicationSchema.index({ eventTitle: 1, location: 1 }); // booth stock counting

// Dev me hot-reload purana schema cache rakhta hai, isliye usse hata do
if (process.env.NODE_ENV !== "production" && mongoose.models.Application) {
  delete mongoose.models.Application;
}

export default mongoose.models.Application ||
  mongoose.model("Application", ApplicationSchema);