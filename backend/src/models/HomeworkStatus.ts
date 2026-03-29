import mongoose from "mongoose";

export type HomeworkStatusValue = "pending" | "in_progress" | "completed";

const homeworkStatusSchema = new mongoose.Schema(
  {
    homeworkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homework",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

homeworkStatusSchema.index({ homeworkId: 1, studentId: 1 }, { unique: true });

export const HomeworkStatus = mongoose.model("HomeworkStatus", homeworkStatusSchema);
