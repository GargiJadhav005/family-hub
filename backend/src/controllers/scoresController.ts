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
    const studentId = req.query.studentId as string;
    const className = req.query.className as string;

    const query: any = {};

    if (studentId) {
      query.studentId = studentId;
    } else if (className) {
      const students = await Student.find({ className }).select("_id");
      const studentIds = students.map((s) => s._id.toString());
      query.studentId = { $in: studentIds };
    }

    const scores = await Score.find(query)
      .populate("studentId", "name email")
      .sort({ date: -1 });

    const items = scores.map((s: any) => ({
      id: s._id.toString(),
      studentId: s.studentId._id.toString(),
      studentName: s.studentId.name,
      subject: s.subject,
      testName: s.testName,
      scorePercent: s.scorePercent,
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
      id: score._id.toString(),
      studentId,
      subject,
      testName,
      scorePercent,
      grade,
      date,
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
