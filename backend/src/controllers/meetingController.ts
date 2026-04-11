import { Response } from "express";
import { Meeting, Student, Notification } from "../models";
import { AuthRequest } from "../middleware/auth";
import { getMetaValue } from "../utils/auth";
import { notifyMeetingScheduled } from "../utils/notification";
import { z } from "zod";

/**
 * ============================
 * 📌 Validation Schema
 * ============================
 */
const CreateMeetingSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  date: z.string().min(1, "Date is required"),
  timeLabel: z.string().min(1, "Time is required"),
  mode: z.enum(["प्रत्यक्ष", "ऑनलाइन"]),
  notes: z.string().max(500).optional(),
});

/**
 * ============================
 * 📌 GET /api/meetings
 * - Teacher → their class students
 * - Parent → their children
 * - Admin → all meetings
 * ============================
 */
export async function listMeetings(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    let filter: any = {};

    /**
     * 🧑‍🏫 TEACHER
     */
    if (user.role === "teacher") {
      filter.teacherId = user._id;

      const teacherClass = getMetaValue(user.meta, "class");

      if (teacherClass) {
        const classStudents = await Student.find({
          className: teacherClass,
        }).select("_id");

        filter.studentId = {
          $in: classStudents.map((s) => s._id),
        };
      }
    }

    /**
     * 👨‍👩‍👧 PARENT
     */
    else if (user.role === "parent") {
      const students = await Student.find({
        parentUserId: user._id,
      }).select("_id");

      filter.studentId = {
        $in: students.map((s) => s._id),
      };
    }

    /**
     * 🛠️ ADMIN (NEW)
     */
    else if (user.role === "admin") {
      filter = {};
    }

    /**
     * 📦 FETCH DATA
     */
    const meetings = await Meeting.find(filter)
      .sort({ date: 1 })
      .limit(50)
      .populate("studentId", "name className")
      .lean();

    /**
     * 📤 FORMAT RESPONSE (AI + FRONTEND FRIENDLY)
     */
    const formatted = meetings.map((m: any) => ({
      id: m._id.toString(),
      student: m.studentId
        ? {
            id: m.studentId._id,
            name: m.studentId.name,
            className: m.studentId.className,
          }
        : null,
      date: m.date,
      timeLabel: m.timeLabel,
      mode: m.mode,
      notes: m.notes || null,
      status: m.status || "scheduled",
      teacherName: m.teacherName,
      createdAt: m.createdAt,
    }));

    res.json({ meetings: formatted });
  } catch (err) {
    console.error("❌ listMeetings error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * ============================
 * 📌 POST /api/meetings
 * Teacher/Admin schedules meeting
 * ============================
 */
export async function createMeeting(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    /**
     * 🔐 ROLE CHECK
     */
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      res.status(403).json({
        error: "Only teachers or admins can schedule meetings",
      });
      return;
    }

    /**
     * 📥 VALIDATION
     */
    const body = CreateMeetingSchema.parse(req.body);

    /**
     * 🔍 VERIFY STUDENT
     */
    const student = await Student.findById(body.studentId);
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    /**
     * 🚫 CLASS SECURITY (Teacher only)
     */
    if (req.user.role === "teacher") {
      const teacherClass = getMetaValue(req.user.meta, "class");

      if (teacherClass && student.className !== teacherClass) {
        res.status(403).json({
          error: "You can only schedule meetings for your class students",
        });
        return;
      }
    }

    /**
     * 📝 CREATE MEETING
     */
    const meeting = await Meeting.create({
      studentId: body.studentId,
      studentName: student.name, // ✅ auto-set (no need from frontend)
      date: new Date(body.date),
      timeLabel: body.timeLabel,
      mode: body.mode,
      notes: body.notes,
      teacherId: req.user._id,
      teacherName: req.user.name,
      parentId: student.parentUserId,
      status: "scheduled",
    });

    /**
     * Send notification to parent
     */
    await notifyMeetingScheduled(
      student.parentUserId.toString(),
      req.user.name,
      body.date,
      body.mode
    );

    /**
     * 📤 RESPONSE
     */
    res.status(201).json({
      meeting: {
        id: meeting._id.toString(),
        studentId: meeting.studentId,
        studentName: meeting.studentName,
        date: meeting.date,
        timeLabel: meeting.timeLabel,
        mode: meeting.mode,
        notes: meeting.notes,
        status: meeting.status,
        teacherName: meeting.teacherName,
        createdAt: meeting.createdAt,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: err.errors,
      });
      return;
    }

    console.error("❌ createMeeting error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * ============================
 * 📌 PATCH /api/meetings/:id/status
 * - Teacher/Admin → update any
 * - Parent → only their meeting
 * ============================
 */
export async function updateMeetingStatus(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    /**
     * ✅ VALID STATUS
     */
    const allowedStatus = ["scheduled", "completed", "cancelled"];
    if (!allowedStatus.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    /**
     * 🔍 FETCH MEETING
     */
    const meeting = await Meeting.findById(id);
    if (!meeting) {
      res.status(404).json({ error: "Meeting not found" });
      return;
    }

    /**
     * 🔐 ACCESS CONTROL
     */
    if (req.user.role === "teacher" && !meeting.teacherId?.equals(req.user._id)) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    if (req.user.role === "parent" && !meeting.parentId?.equals(req.user._id)) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    /**
     * 📝 UPDATE
     */
    meeting.status = status;
    await meeting.save();

    /**
     * Send notification about status change
     */
    if (meeting.parentId) {
      await Notification.create({
        recipientId: meeting.parentId,
        userId: meeting.parentId,
        event: "meeting_scheduled",
        title: "Meeting Status Updated",
        message: `Meeting status changed to ${status}`,
        data: { status, meetingId: meeting._id },
      });
    }

    res.json({
      meeting: {
        id: meeting._id.toString(),
        status: meeting.status,
        updatedAt: new Date(),
      },
    });
  } catch (err) {
    console.error("UpdateMeetingStatus error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * ============================
 * PATCH /api/meetings/:id
 * Update meeting details (teacher/admin only)
 * ============================
 */
export async function updateMeeting(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    const { date, timeLabel, mode, notes } = req.body;

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      res.status(404).json({ error: "Meeting not found" });
      return;
    }

    // Access control
    if (
      req.user.role === "teacher" &&
      !meeting.teacherId?.equals(req.user._id)
    ) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    // Update fields if provided
    if (date) meeting.date = new Date(date);
    if (timeLabel) meeting.timeLabel = timeLabel;
    if (mode) meeting.mode = mode;
    if (notes !== undefined) meeting.notes = notes;

    await meeting.save();

    // Notify parent about update
    if (meeting.parentId) {
      await Notification.create({
        recipientId: meeting.parentId,
        userId: meeting.parentId,
        event: "meeting_scheduled",
        title: "Meeting Updated",
        message: `Meeting with ${meeting.teacherName} has been updated`,
        data: { meetingId: meeting._id },
      });
    }

    res.json({
      message: "Meeting updated successfully",
      meeting: {
        id: meeting._id.toString(),
        date: meeting.date,
        timeLabel: meeting.timeLabel,
        mode: meeting.mode,
        notes: meeting.notes,
        status: meeting.status,
        updatedAt: new Date(),
      },
    });
  } catch (err) {
    console.error("UpdateMeeting error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * ============================
 * DELETE /api/meetings/:id
 * Delete meeting (teacher/admin only)
 * ============================
 */
export async function deleteMeeting(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { id } = req.params;

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      res.status(404).json({ error: "Meeting not found" });
      return;
    }

    // Access control - only creator or admin can delete
    if (
      req.user.role === "teacher" &&
      !meeting.teacherId?.equals(req.user._id)
    ) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    // Notify parent about cancellation
    if (meeting.parentId) {
      await Notification.create({
        recipientId: meeting.parentId,
        userId: meeting.parentId,
        event: "meeting_scheduled",
        title: "Meeting Cancelled",
        message: `Meeting with ${meeting.teacherName} has been cancelled`,
        data: { meetingId: meeting._id },
      });
    }

    await Meeting.findByIdAndDelete(id);

    res.json({ message: "Meeting deleted successfully" });
  } catch (err) {
    console.error("DeleteMeeting error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
