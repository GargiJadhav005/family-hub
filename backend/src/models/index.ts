//////////////////////////////////////////////////////////////////
// 📦 CENTRAL MODEL EXPORT FILE (AI-FRIENDLY + SCALABLE)
//////////////////////////////////////////////////////////////////

/**
 * 👤 USER & AUTH
 */
export { User } from "./User";
export type { UserRole } from "./User";

/**
 * 🎓 STUDENT MANAGEMENT
 */
export { Student } from "./Student";

/**
 * 📚 ACADEMIC MODULES
 */
export { Homework } from "./Homework";
export { HomeworkStatus } from "./HomeworkStatus";
export type { HomeworkStatusValue } from "./HomeworkStatus";

export { Attendance } from "./Attendance";
export type { AttendanceStatusValue } from "./Attendance";

export { Score } from "./Score";
export { ReportCard } from "./ReportCard";

/**
 * 📢 COMMUNICATION MODULES
 */
export { Announcement } from "./Announcement";
export type { AnnouncementAudience } from "./Announcement";

export { Notification } from "./Notification";
export type { NotificationEvent } from "./Notification";

export { Enquiry } from "./Enquiry";

/**
 * 📅 EVENTS & SCHEDULING
 */
export { Event } from "./Event";
export type { EventType, AudienceType } from "./Event";

export { Meeting } from "./Meeting";
export type { MeetingMode, MeetingStatus } from "./Meeting";

/**
 * 📝 LEARNING & INTERACTION
 */
export { Instruction } from "./Instruction";
export { Quiz, QuizResult } from "./Quiz";

/**
 * 🚀 FUTURE EXTENSIONS (KEEP FOR SCALABILITY)
 * (AI modules, analytics, recommendations, etc.)
 */
// export { Recommendation } from "./Recommendation";
// export { ActivityLog } from "./ActivityLog";