import mongoose, { Document, Schema } from "mongoose";

/**
 * Audience Types
 */
export type AnnouncementAudience =
  | "all"
  | "teachers"
  | "students"
  | "parents";

/**
 * Announcement Interface
 */
export interface IAnnouncement extends Document {
  title: string;
  content: string;
  audience: AnnouncementAudience;
  targetClasses?: string[]; // NEW: class targeting
  createdBy: mongoose.Types.ObjectId;
  priority: "low" | "medium" | "high";
  isActive: boolean;
  expiresAt?: Date; // NEW: auto-expiry
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Announcement Schema
 */
const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    content: {
      type: String,
      required: true,
      minlength: 5,
    },

    audience: {
      type: String,
      enum: ["all", "teachers", "students", "parents"],
      required: true,
      index: true,
    },

    // 🎯 Target specific classes (for students/parents)
    targetClasses: [
      {
        type: String,
        trim: true,
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ⏳ Expiry (optional)
    expiresAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for performance
 */
announcementSchema.index({ audience: 1, isActive: 1 });
announcementSchema.index({ createdAt: -1 });

/**
 * Model
 */
export const Announcement = mongoose.model<IAnnouncement>(
  "Announcement",
  announcementSchema
);