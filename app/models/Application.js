import mongoose from "mongoose";

// Reuse this in the admin API / dashboard so the values never get out of sync
export const APPLICATION_STATUSES = ["pending", "approved", "rejected"];

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

    ip: { type: String, default: "" },
  },
  { timestamps: true }
);

ApplicationSchema.index({ email: 1, eventTitle: 1 });

export default mongoose.models.Application ||
  mongoose.model("Application", ApplicationSchema);