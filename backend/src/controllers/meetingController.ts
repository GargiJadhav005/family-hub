import { Response } from "express";
import { Meeting, Student } from "../models";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

const CreateMeetingSchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  date: z.string().datetime(),
  timeLabel: z.string(),
  mode: z.enum(["प्रत्यक्ष", "ऑनलाइन"]),
  notes: z.string().optional(),
});

// GET /api/meetings → teacher sees all, parent sees theirs
export async function listMeetings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    let filter: any = {};
    if (user.role === "teacher") {
      filter.teacherId = user._id;
    } else if (user.role === "parent") {
      // Find students where this user is the parent
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

// POST /api/meetings → teacher books a meeting
export async function createMeeting(req: AuthRequest, res: Response): Promise<void> {
  try {
    const body = CreateMeetingSchema.parse(req.body);

    // Find the student to get parentId
    const student = await Student.findById(body.studentId);
    const meeting = await Meeting.create({
      ...body,
      date: new Date(body.date),
      teacherId: req.user._id,
      teacherName: req.user.name,
      parentId: student?.parentUserId,
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

// PATCH /api/meetings/:id/status → teacher marks complete/cancelled
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
