import mongoose, { Document, Schema } from "mongoose";

/**
 * Status Types
 */
export type HomeworkStatusValue =
  | "pending"
  | "in_progress"
  | "submitted"
  | "completed"
  | "late";

/**
 * Interface
 */
export interface IHomeworkStatus extends Document {
  homeworkId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;

  status: HomeworkStatusValue;

  submissionText?: string | null; // NEW: student answer
  attachments?: string[]; // NEW: file uploads

  feedback?: string | null;
  gradedBy?: mongoose.Types.ObjectId | null; // teacher/admin
  gradedAt?: Date | null;

  submittedAt?: Date | null; // NEW
  isLate: boolean; // NEW

  notified: boolean; // NEW: parent notified

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema
 */
const homeworkStatusSchema = new Schema<IHomeworkStatus>(
  {
    homeworkId: {
      type: Schema.Types.ObjectId,
      ref: "Homework",
      required: true,
      index: true,
    },

    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    /**
     * 📊 Status
     */
    status: {
      type: String,
      enum: ["pending", "in_progress", "submitted", "completed", "late"],
      default: "pending",
      index: true,
    },

    /**
     * 📝 Student submission
     */
    submissionText: {
      type: String,
      default: null,
      trim: true,
    },

    attachments: [
      {
        type: String,
      },
    ],

    /**
     * 👨‍🏫 Teacher feedback
     */
    feedback: {
      type: String,
      default: null,
      trim: true,
    },

    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    gradedAt: {
      type: Date,
      default: null,
    },

    /**
     * ⏱ Submission tracking
     */
    submittedAt: {
      type: Date,
      default: null,
      index: true,
    },

    isLate: {
      type: Boolean,
      default: false,
    },

    /**
     * 🔔 Notification tracking
     */
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
 * 🚀 Unique constraint
 */
homeworkStatusSchema.index(
  { homeworkId: 1, studentId: 1 },
  { unique: true }
);

/**
 * 📊 Additional indexes
 */
homeworkStatusSchema.index({ studentId: 1, status: 1 });
homeworkStatusSchema.index({ homeworkId: 1, status: 1 });

/**
 * 🧠 Pre-save logic (Auto late detection)
 */
homeworkStatusSchema.pre("save", async function (next) {
  try {
    if (this.submittedAt) {
      const Homework = mongoose.model("Homework");
      const hw: any = await Homework.findById(this.homeworkId);

      if (hw && hw.dueDate) {
        const due = new Date(hw.dueDate);
        const submitted = new Date(this.submittedAt);

        if (submitted > due) {
          this.isLate = true;
          if (this.status === "submitted") {
            this.status = "late";
          }
        }
      }
    }

    next();
  } catch (err) {
    next(err as any);
  }
});

/**
 * Model
 */
export const HomeworkStatus = mongoose.model<IHomeworkStatus>(
  "HomeworkStatus",
  homeworkStatusSchema
);