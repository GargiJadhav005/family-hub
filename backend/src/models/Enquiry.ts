import mongoose, { Document, Schema } from "mongoose";

/**
 * Enquiry Status
 */
export type EnquiryStatus = "new" | "read" | "responded";

/**
 * Interface
 */
export interface IEnquiry extends Document {
  name: string;
  email: string;
  phone: string;
  message: string;

  status: EnquiryStatus;
  priority: "low" | "medium" | "high";

  response?: string | null;
  respondedBy?: mongoose.Types.ObjectId | null;
  respondedAt?: Date | null;

  forwardedToEmail?: string | null; // NEW: school email
  isForwarded: boolean; // NEW: track mail sent

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema
 */
const enquirySchema = new Schema<IEnquiry>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      index: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 15,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1000,
    },

    /**
     * Workflow tracking
     */
    status: {
      type: String,
      enum: ["new", "read", "responded"],
      default: "new",
      index: true,
    },

    /**
     * Priority for admin dashboard
     */
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      index: true,
    },

    /**
     * Admin response
     */
    response: {
      type: String,
      default: null,
      trim: true,
    },

    respondedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    respondedAt: {
      type: Date,
      default: null,
    },

    /**
     * 📩 Email Forwarding (IMPORTANT for your requirement)
     */
    forwardedToEmail: {
      type: String,
      default: null,
    },

    isForwarded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * 🚀 Indexes for performance
 */
enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ priority: 1 });

/**
 * 🧠 Pre-save hook (auto priority detection - optional AI logic)
 */
enquirySchema.pre("save", function (next) {
  if (this.message) {
    const msg = this.message.toLowerCase();

    if (
      msg.includes("urgent") ||
      msg.includes("asap") ||
      msg.includes("immediately")
    ) {
      this.priority = "high";
    }
  }
  next();
});

/**
 * Model
 */
export const Enquiry = mongoose.model<IEnquiry>(
  "Enquiry",
  enquirySchema
);