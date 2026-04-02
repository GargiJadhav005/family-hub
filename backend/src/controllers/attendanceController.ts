import { Request, Response } from "express";
import { Attendance, Student } from "../models";
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

/**
 * GET /api/attendance?date=YYYY-MM-DD
 * Teacher: returns attendance for their class only
 * Parent: returns attendance for their child only
 */
export async function getAttendance(req: AuthRequest, res: Response): Promise<void> {
  try {
    const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
    const user = req.user;
    let filter: any = { date };

    if (user.role === "teacher") {
      const teacherClass = user.meta?.get?.("class") ?? user.meta?.class;
      if (teacherClass) {
        filter.className = teacherClass;
      }
    } else if (user.role === "parent") {
      const children = await Student.find({ parentUserId: user._id }).select("_id");
      filter.studentId = { $in: children.map((c) => c._id) };
    } else if (user.role === "student") {
      const student = await Student.findOne({ studentUserId: user._id });
      if (student) {
        filter.studentId = student._id;
      }
    }

    const records = await Attendance.find(filter).populate("studentId", "name roll className");

    const items = records.map((a: any) => ({
      id: a._id.toString(),
      studentId: a.studentId?._id?.toString(),
      studentName: a.studentId?.name,
      studentRoll: a.studentId?.roll,
      className: a.className,
      date: a.date,
      status: a.status,
    }));

    res.json({ attendance: items });
  } catch (err) {
    console.error("GetAttendance error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/attendance
 * Teacher only: mark attendance for students in their class
 * Body: { date: "YYYY-MM-DD", records: [{ studentId, status }] }
 * studentId here is Student._id (not User._id)
 */
export async function markAttendance(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (req.user.role !== "teacher") {
      res.status(403).json({ error: "Only teachers can mark attendance" });
      return;
    }

    const body = AttendanceBodySchema.parse(req.body);
    const { date, records } = body;

    const teacherClass = req.user.meta?.get?.("class") ?? req.user.meta?.class;
    if (!teacherClass) {
      res.status(400).json({ error: "Teacher class assignment not found" });
      return;
    }

    // Validate all students belong to teacher's class
    const studentIds = records.map((r) => r.studentId);
    const validStudents = await Student.find({
      _id: { $in: studentIds },
      className: teacherClass,
    });

    if (validStudents.length !== studentIds.length) {
      res.status(400).json({
        error: "Some students do not belong to your class",
        expected: studentIds.length,
        found: validStudents.length,
      });
      return;
    }

    const results = await Promise.all(
      records.map((r) =>
        Attendance.findOneAndUpdate(
          { studentId: r.studentId, date },
          {
            studentId: r.studentId,
            className: teacherClass,
            date,
            status: r.status,
            markedByTeacherId: req.user._id,
          },
          { upsert: true, new: true }
        )
      )
    );

    res.json({
      ok: true,
      message: `Attendance marked for ${results.length} students on ${date}`,
      recordsCount: results.length,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("MarkAttendance error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
