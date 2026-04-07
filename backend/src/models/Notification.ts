import mongoose from "mongoose";

export type NotificationEvent =
  | "homework_uploaded"
  | "quiz_created"
  | "new_announcement"
  | "attendance_marked"
  | "meeting_scheduled"
  | "new_enquiry"
  | "new_user_created";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: String,
      enum: [
        "homework_uploaded",
        "quiz_created",
        "new_announcement",
        "attendance_marked",
        "meeting_scheduled",
        "new_enquiry",
        "new_user_created",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    relatedModel: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
