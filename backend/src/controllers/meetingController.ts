import { Response } from "express";
import { Meeting, Student } from "../models";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

const CreateMeetingSchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  date: z.string(),
  timeLabel: z.string(),
  mode: z.enum(["प्रत्यक्ष", "ऑनलाइन"]),
  notes: z.string().optional(),
});

/**
 * GET /api/meetings
 * Teacher: sees meetings for their class students only
 * Parent: sees meetings for their children
 */
export async function listMeetings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    let filter: any = {};

    if (user.role === "teacher") {
      filter.teacherId = user._id;
      // Also filter by class students
      const teacherClass = user.meta?.get?.("class") ?? user.meta?.class;
      if (teacherClass) {
        const classStudents = await Student.find({ className: teacherClass }).select("_id");
        filter.studentId = { $in: classStudents.map((s) => s._id) };
      }
    } else if (user.role === "parent") {
      const students = await Student.find({ parentUserId: user._id });
      const studentIds = students.map((s) => s._id);
      filter.studentId = { $in: studentIds };
    }

    const meetings = await Meeting.find(filter).sort({ date: 1 }).limit(20);
    res.json({ meetings });
  } catch (err) {
    console.error("listMeetings error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/meetings
 * Teacher books a meeting — validates student belongs to their class
 */
export async function createMeeting(req: AuthRequest, res: Response): Promise<void> {
  try {
    const body = CreateMeetingSchema.parse(req.body);

    // Validate student belongs to teacher's class
    const student = await Student.findById(body.studentId);
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    const teacherClass = req.user.meta?.get?.("class") ?? req.user.meta?.class;
    if (teacherClass && student.className !== teacherClass) {
      res.status(403).json({ error: "Student not in your class" });
      return;
    }

    const meeting = await Meeting.create({
      ...body,
      date: new Date(body.date),
      teacherId: req.user._id,
      teacherName: req.user.name,
      parentId: student.parentUserId,
    });

    res.status(201).json({ meeting });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("createMeeting error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// PATCH /api/meetings/:id/status
export async function updateMeetingStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const meeting = await Meeting.findByIdAndUpdate(id, { status }, { new: true });
    if (!meeting) {
      res.status(404).json({ error: "Meeting not found" });
      return;
    }
    res.json({ meeting });
  } catch (err) {
    console.error("updateMeetingStatus error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
