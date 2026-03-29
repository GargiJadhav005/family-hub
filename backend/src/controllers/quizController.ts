import { Request, Response } from "express";
import { Quiz, QuizResult, Student } from "../models";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

const CreateQuizSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  className: z.string().min(1),
  icon: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  questions: z.array(
    z.object({
      question: z.string().min(1),
      options: z.array(z.string()).min(2),
      correctIndex: z.number().int().min(0),
    })
  ).min(1),
});

const SubmitQuizSchema = z.object({
  answers: z.array(z.number().int().min(0)),
});

// GET /api/quizzes?className=X → list quizzes for a class
export async function listQuizzes(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    let filter: any = {};
    // meta can be a Mongoose Map or plain object
    const metaClass = user.meta?.get?.("class") ?? user.meta?.class;
    if (user.role === "student" && metaClass) {
      filter.className = metaClass;
    } else if (req.query.className) {
      filter.className = req.query.className;
    }
    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
    res.json({ quizzes });
  } catch (err) {
    console.error("listQuizzes error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/quizzes → teacher creates a quiz
export async function createQuiz(req: AuthRequest, res: Response): Promise<void> {
  try {
    const body = CreateQuizSchema.parse(req.body);
    const quiz = await Quiz.create({
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      createdByTeacherId: req.user._id,
    });
    res.status(201).json({ quiz });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("createQuiz error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /api/quizzes/:id → get a single quiz (strip correct answers for students)
export async function getQuiz(req: AuthRequest, res: Response): Promise<void> {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    const isTeacher = req.user.role === "teacher";
    const quizObj: any = quiz.toObject();
    if (!isTeacher) {
      // Strip correct answers for students
      quizObj.questions = quizObj.questions.map(({ correctIndex, ...q }: any) => q);
    }
    res.json({ quiz: quizObj });
  } catch (err) {
    console.error("getQuiz error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/quizzes/:id/submit → student submits quiz
export async function submitQuiz(req: AuthRequest, res: Response): Promise<void> {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }

    const { answers } = SubmitQuizSchema.parse(req.body);
    const student = await Student.findOne({ studentUserId: req.user._id });
    if (!student) {
      res.status(404).json({ error: "Student record not found" });
      return;
    }

    // Allow re-submission (upsert) — student can replay
    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) score++;
    });

    const result = await QuizResult.findOneAndUpdate(
      { quizId: quiz._id, studentId: student._id },
      { answers, score, total: quiz.questions.length, submittedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(201).json({ result, score, total: quiz.questions.length });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("submitQuiz error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /api/quizzes/:id/results → teacher sees all results
export async function getQuizResults(req: AuthRequest, res: Response): Promise<void> {
  try {
    const results = await QuizResult.find({ quizId: req.params.id }).populate("studentId", "name roll");
    res.json({ results });
  } catch (err) {
    console.error("getQuizResults error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
