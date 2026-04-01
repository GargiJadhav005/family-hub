import { Request, Response } from "express";
import { Score, Student } from "../models";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

const ScoreSchema = z.object({
  studentId: z.string(),
  subject: z.string().min(1),
  testName: z.string().min(1),
  scorePercent: z.number().min(0).max(100),
  grade: z.string().min(1),
  date: z.string(),
});

export async function getScores(req: AuthRequest, res: Response): Promise<void> {
  try {
    const query: any = {};
    const forceStudentId = req.query.studentId as string | undefined;
    const className = req.query.className as string | undefined;

    if (forceStudentId) {
      query.studentId = forceStudentId;
    } else if (req.user.role === "student") {
      // Auto-locate the Student record for this user
      const studentDoc = await Student.findOne({ studentUserId: req.user._id });
      if (!studentDoc) {
        res.json({ scores: [] });
        return;
      }
      query.studentId = studentDoc._id;
    } else if (className) {
      const students = await Student.find({ className }).select("_id");
      query.studentId = { $in: students.map((s) => s._id) };
    }

    const scores = await Score.find(query)
      .populate("studentId", "name email")
      .sort({ date: -1 })
      .limit(20);

    const items = scores.map((s: any) => ({
      _id: s._id.toString(),
      id: s._id.toString(),
      studentId: s.studentId?._id?.toString(),
      studentName: s.studentId?.name,
      subject: s.subject,
      title: s.testName,
      score: s.scorePercent,
      total: 100,
      grade: s.grade,
      date: s.date,
    }));

    res.json({ scores: items });
  } catch (err) {
    console.error("GetScores error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}


export async function addScore(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (req.user.role !== "teacher") {
      res.status(403).json({ error: "Only teachers can add scores" });
      return;
    }

    const body = ScoreSchema.parse(req.body);
    const { studentId, subject, testName, scorePercent, grade, date } = body;

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
    res.status(500).json({ error: "Internal server error" });
  }
}
