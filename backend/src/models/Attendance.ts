import mongoose, { Document, Schema } from "mongoose";

/**
 * Attendance Status Type
 */
export type AttendanceStatusValue = "present" | "absent" | "late";

/**
 * Interface (for TypeScript safety)
 */
export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  className: string;
  date: Date;
  status: AttendanceStatusValue;
  markedByTeacherId: mongoose.Types.ObjectId;
  notes?: string | null;
  notified?: boolean; // NEW: track if parent notified
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema
 */
const attendanceSchema = new Schema<IAttendance>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    className: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // ✅ FIX: Use Date instead of string
    date: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["present", "absent", "late"],
      required: true,
      index: true,
    },

    markedByTeacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    notes: {
      type: String,
      default: null,
      trim: true,
      maxlength: 300,
    },

    // 🔔 NEW: track notification sent to parent
    notified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * 🚀 Indexes (VERY IMPORTANT)
 */

// One attendance per student per day
attendanceSchema.index(
  { studentId: 1, date: 1 },
  { unique: true }
);

// Class-wise attendance
attendanceSchema.index({ className: 1, date: 1 });

// For analytics (monthly reports)
attendanceSchema.index({ studentId: 1, status: 1 });

/**
 * 🧠 Pre-save hook (Normalize date → remove time)
 */
attendanceSchema.pre("save", function (next) {
  if (this.date) {
    const d = new Date(this.date);
    d.setHours(0, 0, 0, 0);
    this.date = d;
  }
  next();
});

/**
 * Model
 */
export const Attendance = mongoose.model<IAttendance>(
  "Attendance",
  attendanceSchema
);