/**
 * Notification System Foundation
 * Supports sending notifications for key events
 */
import { Notification } from "../models";
import mongoose from "mongoose";

export type NotificationEventType =
  | "homework_assigned"
  | "grade_posted"
  | "meeting_scheduled"
  | "attendance_marked"
  | "homework_completed"
  | "announcement_posted"
  | "enquiry_received"
  | "message_received";

export interface NotificationPayload {
  recipientId: string;
  event: NotificationEventType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

/**
 * Send a notification
 * @param payload - Notification data
 * @returns Created notification document or null if error
 */
export async function sendNotification(
  payload: NotificationPayload
): Promise<any> {
  try {
    const notification = new Notification({
      recipientId: new mongoose.Types.ObjectId(payload.recipientId),
      event: payload.event,
      title: payload.title,
      message: payload.message,
      data: payload.data || {},
      read: false,
      createdAt: new Date(),
    });

    const saved = await notification.save();
    console.log(
      `📬 Notification sent to ${payload.recipientId}: ${payload.title}`
    );
    return saved;
  } catch (error) {
    console.error("Error sending notification:", error);
    return null;
  }
}

/**
 * Notify teacher when homework is assigned to a class
 */
export async function notifyHomeworkAssigned(
  studentIds: string[],
  homeworkTitle: string,
  dueDate: string
): Promise<void> {
  for (const studentId of studentIds) {
    await sendNotification({
      recipientId: studentId,
      event: "homework_assigned",
      title: "नया गृहपाठ",
      message: `नया गृहपाठ दिया गया: ${homeworkTitle}`,
      data: {
        homeworkTitle,
        dueDate,
      },
    });
  }
}

/**
 * Notify student when grade is posted
 */
export async function notifyGradePosted(
  studentId: string,
  subject: string,
  score: number,
  maxScore: number
): Promise<void> {
  const percentage = ((score / maxScore) * 100).toFixed(1);
  await sendNotification({
    recipientId: studentId,
    event: "grade_posted",
    title: "आपका स्कोर प्रकाशित हुआ",
    message: `${subject}: ${score}/${maxScore} (${percentage}%)`,
    data: {
      subject,
      score,
      maxScore,
      percentage,
    },
  });
}

/**
 * Notify parent when meeting is scheduled
 */
export async function notifyMeetingScheduled(
  parentId: string,
  teacherName: string,
  meetingDate: string,
  meetingMode: string
): Promise<void> {
  await sendNotification({
    recipientId: parentId,
    event: "meeting_scheduled",
    title: "मीटिंग निर्धारित की गई",
    message: `${teacherName} के साथ ${meetingDate} को ${meetingMode} मीटिंग`,
    data: {
      teacherName,
      meetingDate,
      meetingMode,
    },
  });
}

/**
 * Notify parent when attendance is marked
 */
export async function notifyAttendanceMarked(
  studentId: string,
  status: "present" | "absent" | "late",
  date: string
): Promise<void> {
  const statusMap = {
    present: "उपस्थित",
    absent: "अनुपस्थित",
    late: "देर से",
  };

  // Get parent ID from student record
  try {
    const { Student } = await import("../models");
    const student = await Student.findOne({ studentUserId: studentId });
    if (student?.parentUserId) {
      await sendNotification({
        recipientId: student.parentUserId.toString(),
        event: "attendance_marked",
        title: "उपस्थिति अपडेट",
        message: `${date} को: ${statusMap[status]}`,
        data: {
          status,
          date,
        },
      });
    }
  } catch (error) {
    console.error("Error notifying attendance:", error);
  }
}

/**
 * Notify teacher when homework is completed
 */
export async function notifyHomeworkCompleted(
  teacherId: string,
  studentName: string,
  homeworkTitle: string
): Promise<void> {
  await sendNotification({
    recipientId: teacherId,
    event: "homework_completed",
    title: "गृहपाठ पूर्ण हुआ",
    message: `${studentName} ने ${homeworkTitle} पूर्ण किया`,
    data: {
      studentName,
      homeworkTitle,
    },
  });
}

/**
 * Notify when announcement is posted
 */
export async function notifyAnnouncementPosted(
  recipientIds: string[],
  announcementTitle: string
): Promise<void> {
  for (const recipientId of recipientIds) {
    await sendNotification({
      recipientId,
      event: "announcement_posted",
      title: "नई घोषणा",
      message: announcementTitle,
      data: {
        announcementTitle,
      },
    });
  }
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId: string): Promise<any[]> {
  try {
    const objectId = new mongoose.Types.ObjectId(userId);
    const notifications = await Notification.find({
      recipientId: objectId,
      read: false,
    }).sort({ createdAt: -1 });

    return notifications;
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<boolean> {
  try {
    const result = await Notification.findByIdAndUpdate(notificationId, {
      read: true,
      readAt: new Date(),
    });

    return !!result;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<boolean> {
  try {
    const result = await Notification.findByIdAndDelete(notificationId);
    return !!result;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
}
