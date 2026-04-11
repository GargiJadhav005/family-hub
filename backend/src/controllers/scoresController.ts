import { Request, Response } from "express";
import { Score, Student, Attendance } from "../models";
import { AuthRequest } from "../middleware/auth";
import { getMetaValue } from "../utils/auth";
import { z } from "zod";

const ScoreSchema = z.object({
  studentId: z.string(),
  subject: z.string().min(1),
  testName: z.string().min(1),
  scorePercent: z.number().min(0).max(100),
  grade: z.string().min(1),
  date: z.string(),
});

/**
 * GET /api/scores?studentId=X&className=X
 * - Teacher: defaults to their class if no filter
 * - Student: auto-resolves to their Student record
 * - Parent: auto-resolves to their children
 * All studentId references are Student._id
 */
export async function getScores(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const query: any = {};
    const forceStudentId = req.query.studentId as string | undefined;
    const className = req.query.className as string | undefined;

    if (forceStudentId) {
      // Specific student requested — validate access
      if (req.user.role === "teacher") {
        const teacherClass = getMetaValue(req.user.meta, "class");
        const student = await Student.findById(forceStudentId);
        if (student && student.className !== teacherClass) {
          res.status(403).json({ error: "Student not in your class" });
          return;
        }
      }
      query.studentId = forceStudentId;
    } else if (req.user.role === "student") {
      // Auto-locate the Student record for this user
      const studentDoc = await Student.findOne({ studentUserId: req.user._id });
      if (!studentDoc) {
        res.json({ scores: [] });
        return;
      }
      query.studentId = studentDoc._id;
    } else if (req.user.role === "parent") {
      const children = await Student.find({ parentUserId: req.user._id }).select("_id");
      query.studentId = { $in: children.map((c) => c._id) };
    } else if (req.user.role === "teacher") {
      // Default: all students in teacher's class
      const teacherClass = className || getMetaValue(req.user.meta, "class");
      if (teacherClass) {
        const students = await Student.find({ className: teacherClass }).select("_id");
        query.studentId = { $in: students.map((s) => s._id) };
      }
    } else if (className) {
      // Admin or other with className filter
      const students = await Student.find({ className }).select("_id");
      query.studentId = { $in: students.map((s) => s._id) };
    }

    const scores = await Score.find(query)
      .populate("studentId", "name roll className")
      .sort({ date: -1 })
      .limit(50);

    const items = scores.map((s: any) => ({
      _id: s._id.toString(),
      id: s._id.toString(),
      studentId: s.studentId?._id?.toString(),
      studentName: s.studentId?.name,
      studentRoll: s.studentId?.roll,
      subject: s.subject,
      title: s.testName,
      testName: s.testName,
      score: s.scorePercent,
      scorePercent: s.scorePercent,
      total: 100,
      grade: s.grade,
      date: s.date,
    }));

    res.json({ scores: items });
  } catch (err: any) {
    console.error("GetScores error:", err);
    res.status(500).json({ 
      error: "Failed to fetch scores",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
}


export async function addScore(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (req.user.role !== "teacher") {
      res.status(403).json({ error: "Only teachers can add scores" });
      return;
    }

    const body = ScoreSchema.parse(req.body);
    const { studentId, subject, testName, scorePercent, grade, date } = body;

    // Validate student belongs to teacher's class
    const teacherClass = getMetaValue(req.user.meta, "class");
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    if (teacherClass && student.className !== teacherClass) {
      res.status(403).json({ error: "Student not in your class" });
      return;
    }

    const score = new Score({
      studentId,
      subject,
      testName,
      scorePercent,
      grade,
      date,
    });

    await score.save();

    res.status(201).json({
      score: {
        id: score._id.toString(),
        studentId,
        studentName: student.name,
        subject,
        testName,
        scorePercent,
        grade,
        date,
      }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("AddScore error:", err);
    res.status(500).json({ 
      error: "Failed to create score",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
}

/**
 * GET /api/scores/analytics
 * Returns pre-aggregated analytics for the teacher's class
 */
export async function getAnalytics(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const teacherClass = getMetaValue(req.user.meta, "class");
    const students = await Student.find(
      teacherClass ? { className: teacherClass } : {}
    ).select("_id name roll className").lean();

    const studentIds = students.map((s: any) => s._id);

    const scores = await Score.find({ studentId: { $in: studentIds } })
      .sort({ date: -1 })
      .lean();

    // ── Subject averages ──────────────────────────────────────
    const bySubject: Record<string, { total: number; count: number }> = {};
    const monthly: Record<string, { total: number; count: number }> = {};

    for (const s of scores) {
      if (!bySubject[s.subject]) bySubject[s.subject] = { total: 0, count: 0 };
      bySubject[s.subject].total += s.scorePercent;
      bySubject[s.subject].count += 1;

      const month = new Date(s.date).toLocaleDateString("en", { month: "short", year: "2-digit" });
      if (!monthly[month]) monthly[month] = { total: 0, count: 0 };
      monthly[month].total += s.scorePercent;
      monthly[month].count += 1;
    }

    const subjectPerformance = Object.entries(bySubject).map(([subject, v]) => ({
      subject,
      avg: Math.round(v.total / v.count),
    }));

    const monthlyTrend = Object.entries(monthly).map(([month, v]) => ({
      month,
      avg: Math.round(v.total / v.count),
    }));

    // ── Weak / strong areas ───────────────────────────────────
    const weakAreas = subjectPerformance
      .filter((s) => s.avg < 75)
      .map((s) => ({
        subject: s.subject,
        topic: "पुनरावृत्ती आवश्यक",
        severity: s.avg < 60 ? "high" : "medium",
        avg: s.avg,
      }));

    const strongAreas = subjectPerformance
      .filter((s) => s.avg >= 85)
      .map((s) => ({
        subject: s.subject,
        topic: "उत्कृष्ट कामगिरी",
        percentage: `${s.avg}%`,
      }));

    // ── Attendance summary ────────────────────────────────────
    const now = new Date();
    const fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const toDate = now.toISOString().slice(0, 10);

    const attRecords = await Attendance.find({
      studentId: { $in: studentIds },
      date: { $gte: fromDate, $lte: toDate },
    }).lean();

    const attByStudent: Record<string, { present: number; total: number }> = {};
    for (const a of attRecords) {
      const sid = a.studentId.toString();
      if (!attByStudent[sid]) attByStudent[sid] = { present: 0, total: 0 };
      attByStudent[sid].total += 1;
      if (a.status === "present") attByStudent[sid].present += 1;
    }

    const totalDays = Object.values(attByStudent).reduce((m, v) => Math.max(m, v.total), 0);
    const avgAttendance = totalDays > 0
      ? Math.round(
          Object.values(attByStudent).reduce((s, v) => s + (v.present / v.total) * 100, 0) /
          Object.keys(attByStudent).length
        )
      : null;

    res.json({
      subjectPerformance,
      monthlyTrend,
      weakAreas,
      strongAreas,
      totalStudents: students.length,
      avgAttendance,
      teacherClass: teacherClass || null,
    });
  } catch (err: any) {
    console.error("getAnalytics error:", err);
    res.status(500).json({ error: "Analytics failed" });
  }
}
