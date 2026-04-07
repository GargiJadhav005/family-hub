import { Response } from "express";
import { Meeting, Student } from "../models";
import { AuthRequest } from "../middleware/auth";
import { getMetaValue } from "../utils/auth";
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
     * 🔔 FUTURE: NOTIFICATION SYSTEM
     */
    // await sendNotification({
    //   userId: student.parentUserId,
    //   title: "New Meeting Scheduled",
    //   message: `${req.user.name} scheduled a meeting on ${body.date}`,
    // });

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
     * 🔔 NOTIFICATION HOOK
     */
    // await sendNotification({
    //   userId: meeting.parentId,
    //   title: "Meeting Updated",
    //   message: `Meeting status changed to ${status}`,
    // });

    res.json({
      meeting: {
        id: meeting._id.toString(),
        status: meeting.status,
        updatedAt: new Date(),
      },
    });
  } catch (err) {
    console.error("❌ updateMeetingStatus error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}