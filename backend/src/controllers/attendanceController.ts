import { Request, Response } from "express";
import mongoose from "mongoose";
import { Attendance, Student } from "../models";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

// ✅ Validation Schemas
const AttendanceRecordSchema = z.object({
  studentId: z.string().min(1),
  status: z.enum(["present", "absent", "late"]),
});

const AttendanceBodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  records: z.array(AttendanceRecordSchema).min(1),
});

// ✅ Helper: Get teacher class safely
const getTeacherClass = (user: any): string | undefined => {
  return user.meta?.get?.("class") ?? user.meta?.class;
};

/**
 * GET /api/attendance?date=YYYY-MM-DD&page=1&limit=10
 */
export async function getAttendance(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const date =
      (req.query.date as string) ||
      new Date().toISOString().slice(0, 10);

    // ✅ Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter: any = { date };

    // ✅ Role-based filtering
    if (user.role === "teacher") {
      const teacherClass = getTeacherClass(user);
      if (!teacherClass) {
        res.status(400).json({ error: "Teacher class not assigned" });
        return;
      }
      filter.className = teacherClass;
    }

    if (user.role === "parent") {
      const children = await Student.find({
        parentUserId: user._id,
      })
        .select("_id")
        .lean();

      filter.studentId = { $in: children.map((c) => c._id) };
    }

    if (user.role === "student") {
      const student = await Student.findOne({
        studentUserId: user._id,
      })
        .select("_id")
        .lean();

      if (!student) {
        res.status(404).json({ error: "Student record not found" });
        return;
      }

      filter.studentId = student._id;
    }

    // ✅ Fetch data
    const [records, total] = await Promise.all([
      Attendance.find(filter)
        .populate("studentId", "name roll className")
        .skip(skip)
        .limit(limit)
        .lean(),

      Attendance.countDocuments(filter),
    ]);

    const items = records.map((a: any) => ({
      id: a._id.toString(),
      studentId: a.studentId?._id?.toString(),
      studentName: a.studentId?.name,
      studentRoll: a.studentId?.roll,
      className: a.className,
      date: a.date,
      status: a.status,
    }));

    res.json({
      attendance: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("GetAttendance error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/attendance
 * Teacher only
 */
export async function markAttendance(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    // ✅ Role check
    if (user.role !== "teacher") {
      res.status(403).json({ error: "Only teachers can mark attendance" });
      return;
    }

    // ✅ Validate body
    const body = AttendanceBodySchema.parse(req.body);
    const { date, records } = body;

    const teacherClass = getTeacherClass(user);
    if (!teacherClass) {
      res.status(400).json({ error: "Teacher class assignment not found" });
      return;
    }

    const studentIds = records.map((r) => r.studentId);

    // ✅ Validate students belong to class
    const validStudents = await Student.find({
      _id: { $in: studentIds },
      className: teacherClass,
    })
      .select("_id")
      .lean();

    if (validStudents.length !== studentIds.length) {
      res.status(400).json({
        error: "Some students do not belong to your class",
        expected: studentIds.length,
        found: validStudents.length,
      });
      return;
    }

    // ✅ Bulk operation (FASTER than Promise.all)
    const bulkOps = records.map((r) => ({
      updateOne: {
        filter: { studentId: new mongoose.Types.ObjectId(r.studentId), date },
        update: {
          $set: {
            studentId: new mongoose.Types.ObjectId(r.studentId),
            className: teacherClass,
            date,
            status: r.status,
            markedByTeacherId: user._id,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(bulkOps as any);

    res.json({
      ok: true,
      message: `Attendance marked for ${records.length} students on ${date}`,
      recordsCount: records.length,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid input",
        details: err.errors,
      });
      return;
    }

    console.error("MarkAttendance error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}