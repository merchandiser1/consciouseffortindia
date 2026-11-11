import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: [/^[a-zA-Z0-9_.]+$/, "Invalid username"],
    },
    // lowercase copy => case-insensitive uniqueness (Shivam123 === shivam123)
    usernameLower: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"],
    },
    password: { type: String, required: true, select: false }, // bcrypt hash
    // No email-verification step yet, so accounts start verified.
    // If you add it later: default false, login already blocks unverified users.
    isVerified: { type: Boolean, default: true },
    // Bumped on password reset => every older JWT stops working.
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
