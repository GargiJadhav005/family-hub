import mongoose from "mongoose";

export type UserRole = "teacher" | "parent" | "student" | "admin";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["teacher", "parent", "student", "admin"],
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    meta: {
      type: Map,
      of: String,
      default: new Map(),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index: email unique per role
userSchema.index({ email: 1, role: 1 }, { unique: true });

export const User = mongoose.model("User", userSchema);
