import { Request, Response } from "express";
import { Homework, HomeworkStatus, Student } from "../models";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";
import mongoose from "mongoose";

// ✅ Validation
const HomeworkSchema = z.object({
  subject: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  className: z.string().min(1),
  dueDate: z.string().optional(),
});

const StatusSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed"]),
  studentId: z.string().optional(),
});

// ✅ Helpers
const getUserClass = (user: any) =>
  user.meta?.get?.("class") || user.meta?.class;

const toClientHomework = (h: any) => ({
  id: h._id.toString(),
  subject: h.subject,
  title: h.title,
  description: h.description,
  dueDate: h.dueDate,
  className: h.className,
  createdAt: h.createdAt,
});

/**
 * GET /api/homework
 */
export async function getHomework(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    // ✅ Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query: any = {};

    if (user.role === "teacher") {
      query.createdByTeacherId = user._id;
    }

    if (user.role === "student") {
      const className = getUserClass(user);
      if (className) query.className = className;
    }

    if (user.role === "parent") {
      const children = await Student.find({ parentUserId: user._id })
        .select("className")
        .lean();

      const classNames = [...new Set(children.map((c) => c.className))];
      query.className = { $in: classNames };
    }

    const [homework, total] = await Promise.all([
      Homework.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Homework.countDocuments(query),
    ]);

    res.json({
      homework: homework.map(toClientHomework),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("GetHomework error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/homework
 */
export async function createHomework(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (user.role !== "teacher") {
      res.status(403).json({ error: "Only teachers can create homework" });
      return;
    }

    const body = HomeworkSchema.parse(req.body);

    const homework = await Homework.create({
      ...body,
      dueDate: body.dueDate || null,
      createdByTeacherId: user._id,
    });

    res.status(201).json({
      homework: toClientHomework(homework),
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("CreateHomework error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PATCH /api/homework/:id/status
 */
export async function updateHomeworkStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid homework ID" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const body = StatusSchema.parse(req.body);
    let { studentId, status } = body;

    // ✅ Resolve student automatically
    if (req.user.role === "student") {
      const studentDoc = await Student.findOne({
        studentUserId: req.user._id,
      }).select("_id");

      if (!studentDoc) {
        res.status(404).json({ error: "Student not found" });
        return;
      }

      studentId = studentDoc._id.toString();
    }

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      res.status(400).json({ error: "Valid studentId required" });
      return;
    }

    const hwStatus = await HomeworkStatus.findOneAndUpdate(
      { homeworkId: id, studentId },
      {
        status,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    ).lean();

    res.json({
      homeworkId: id,
      studentId,
      status: hwStatus.status,
      updatedAt: hwStatus.updatedAt,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("UpdateHomeworkStatus error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/homework/student/all
 */
export async function getStudentAllHomeworkWithStatus(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (req.user.role !== "student") {
      res.status(403).json({ error: "Only students allowed" });
      return;
    }

    const studentDoc = await Student.findOne({
      studentUserId: req.user._id,
    }).lean();

    if (!studentDoc) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    const className = studentDoc.className;

    // ✅ Get homework + statuses in parallel
    const [homeworkList, statuses] = await Promise.all([
      Homework.find({ className }).lean(),
      HomeworkStatus.find({ studentId: studentDoc._id }).lean(),
    ]);

    // ✅ Map statuses (FAST lookup)
    const statusMap = new Map(
      statuses.map((s) => [s.homeworkId.toString(), s])
    );

    const result = homeworkList.map((hw: any) => {
      const s = statusMap.get(hw._id.toString());

      return {
        id: hw._id.toString(),
        subject: hw.subject,
        title: hw.title,
        description: hw.description,
        dueDate: hw.dueDate,
        className: hw.className,
        status: s?.status || "pending",
        statusUpdatedAt: s?.updatedAt || null,
        feedback: s?.feedback || null,
        createdAt: hw.createdAt,
      };
    });

    res.json({ homeworks: result });
  } catch (err) {
    console.error("GetStudentAllHomeworkWithStatus error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}