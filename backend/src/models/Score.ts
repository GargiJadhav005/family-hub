import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    testName: {
      type: String,
      required: true,
      trim: true,
    },
    scorePercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

scoreSchema.index({ studentId: 1, date: -1 });

export const Score = mongoose.model("Score", scoreSchema);
