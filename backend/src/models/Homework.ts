import mongoose from "mongoose";

const homeworkSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: String,
      default: "????????? ????",
    },
    className: {
      type: String,
      default: null,
    },
    section: {
      type: String,
      default: null,
    },
    createdByTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Homework = mongoose.model("Homework", homeworkSchema);
