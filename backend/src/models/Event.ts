import mongoose, { Document, Schema } from "mongoose";

/**
 * Types
 */
export type EventType = "notice" | "event";
export type AudienceType = "all" | "students" | "parents" | "teachers";

/**
 * Interface
 */
export interface IEvent extends Document {
  title: string;
  description: string;

  date: Date;
  endDate?: Date | null; // NEW: multi-day events

  type: EventType;
  icon: string;

  targetAudience: AudienceType;
  targetClasses?: string[]; // NEW: class-specific targeting

  location?: string; // NEW: for events
  priority: "low" | "medium" | "high";

  createdBy: mongoose.Types.ObjectId;

  isActive: boolean;
  isNotified: boolean; // NEW: track notification sent

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema
 */
const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    description: {
      type: String,
      required: true,
      minlength: 5,
    },

    /**
     * 📅 Event Date
     */
    date: {
      type: Date,
      required: true,
      index: true,
    },

    /**
     * 📅 Optional End Date (multi-day event)
     */
    endDate: {
      type: Date,
      default: null,
    },

    type: {
      type: String,
      enum: ["notice", "event"],
      required: true,
      index: true,
    },

    icon: {
      type: String,
      default: "📢",
    },

    /**
     * 👥 Audience targeting
     */
    targetAudience: {
      type: String,
      enum: ["all", "students", "parents", "teachers"],
      default: "all",
      index: true,
    },

    /**
     * 🎯 Class-level targeting
     */
    targetClasses: [
      {
        type: String,
        trim: true,
      },
    ],

    /**
     * 📍 Location (for events)
     */
    location: {
      type: String,
      trim: true,
      default: null,
    },

    /**
     * ⚡ Priority
     */
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      index: true,
    },

    /**
     * 👤 Created by (teacher/admin)
     */
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * 🔔 Notification tracking
     */
    isNotified: {
      type: Boolean,
      default: false,
    },

    /**
     * ✅ Active flag
     */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * 🚀 Indexes
 */
eventSchema.index({ date: 1, targetAudience: 1 });
eventSchema.index({ createdAt: -1 });

/**
 * 🧠 Pre-save: Normalize date (remove time)
 */
eventSchema.pre("save", function (next) {
  if (this.date) {
    const d = new Date(this.date);
    d.setHours(0, 0, 0, 0);
    this.date = d;
  }

  if (this.endDate) {
    const ed = new Date(this.endDate);
    ed.setHours(0, 0, 0, 0);
    this.endDate = ed;
  }

  next();
});

/**
 * Model
 */
export const Event = mongoose.model<IEvent>("Event", eventSchema);