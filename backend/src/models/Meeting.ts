import mongoose from "mongoose";

export type MeetingMode = "प्रत्यक्ष" | "ऑनलाइन";
export type MeetingStatus = "नियोजित" | "पूर्ण" | "रद्द";

const meetingSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacherName: { type: String, required: true },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentName: { type: String, required: true },
    date: { type: Date, required: true },
    timeLabel: { type: String, required: true }, // e.g. "3:30 PM - 4:00 PM"
    mode: {
      type: String,
      enum: ["प्रत्यक्ष", "ऑनलाइन"],
      required: true,
    },
    status: {
      type: String,
      enum: ["नियोजित", "पूर्ण", "रद्द"],
      default: "नियोजित",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Meeting = mongoose.model("Meeting", meetingSchema);
