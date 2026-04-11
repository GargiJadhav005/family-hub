import mongoose from "mongoose";

export type NotificationEvent =
  | "homework_uploaded"
  | "homework_assigned"
  | "homework_completed"
  | "quiz_created"
  | "grade_posted"
  | "new_announcement"
  | "announcement_posted"
  | "attendance_marked"
  | "meeting_scheduled"
  | "new_enquiry"
  | "enquiry_received"
  | "new_user_created"
  | "account_created"
  | "message_received"
  | "announcement";

const notificationSchema = new mongoose.Schema(
  {
    // Support both field names for compatibility (recipientId is preferred)
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    event: {
      type: String,
      enum: [
        "homework_uploaded",
        "homework_assigned",
        "homework_completed",
        "quiz_created",
        "grade_posted",
        "new_announcement",
        "announcement_posted",
        "attendance_marked",
        "meeting_scheduled",
        "new_enquiry",
        "enquiry_received",
        "new_user_created",
        "account_created",
        "message_received",
        "announcement",
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
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    relatedModel: {
      type: String,
      default: null,
    },
    // Support both field names for read status
    read: {
      type: Boolean,
      default: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Virtual to ensure recipientId is always available
notificationSchema.virtual("recipient").get(function () {
  return this.recipientId || this.userId;
});

// Pre-save hook to sync userId and recipientId
notificationSchema.pre("save", function (next) {
  if (this.userId && !this.recipientId) {
    this.recipientId = this.userId;
  }
  if (this.recipientId && !this.userId) {
    this.userId = this.recipientId;
  }
  // Sync read status
  if (this.read !== undefined && this.isRead === undefined) {
    this.isRead = this.read;
  }
  if (this.isRead !== undefined && this.read === undefined) {
    this.read = this.isRead;
  }
  next();
});

// Index for efficient queries
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
