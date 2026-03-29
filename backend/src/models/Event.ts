import mongoose from "mongoose";

export type EventType = "notice" | "event";
export type AudienceType = "all" | "students" | "parents" | "teachers";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ["notice", "event"],
      required: true,
    },
    icon: { type: String, default: "📢" },
    targetAudience: {
      type: String,
      enum: ["all", "students", "parents", "teachers"],
      default: "all",
    },
    createdByTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);
