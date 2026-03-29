import { Request, Response } from "express";
import { Attendance } from "../models";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

const AttendanceRecordSchema = z.object({
  studentId: z.string(),
  status: z.enum(["present", "absent", "late"]),
});

const AttendanceBodySchema = z.object({
  date: z.string(),
  records: z.array(AttendanceRecordSchema),
});

export async function getAttendance(req: AuthRequest, res: Response): Promise<void> {
  try {
    const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);

    const records = await Attendance.find({ date }).populate("studentId", "name email");

    const items = records.map((a: any) => ({
      id: a._id.toString(),
      studentId: a.studentId._id.toString(),
      studentName: a.studentId.name,
      date: a.date,
      status: a.status,
    }));

    res.json({ attendance: items });
  } catch (err) {
    console.error("GetAttendance error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function markAttendance(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (req.user.role !== "teacher") {
      res.status(403).json({ error: "Only teachers can mark attendance" });
      return;
    }

    const body = AttendanceBodySchema.parse(req.body);
    const { date, records } = body;

    await Promise.all(
      records.map((r) =>
        Attendance.findOneAndUpdate(
          { studentId: r.studentId, date },
          {
            studentId: r.studentId,
            date,
            status: r.status,
            markedByTeacherId: req.user._id,
          },
          { upsert: true }
        )
      )
    );

    res.json({ ok: true });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("MarkAttendance error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
