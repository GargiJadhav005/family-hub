import { Request, Response } from "express";
import { Homework, HomeworkStatus } from "../models";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

const HomeworkSchema = z.object({
  subject: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  dueDate: z.string().optional(),
});

export async function getHomework(req: AuthRequest, res: Response): Promise<void> {
  try {
    const query: any = {};
    if (req.user.role === "teacher") {
      query.createdByTeacherId = req.user._id;
    } else if (req.user.role === "student") {
      // Filter by the student's class (stored in user.meta)
      const className = req.user.meta?.get?.("class") || req.user.meta?.class;
      if (className) {
        // Find teacher who created homework for this class — or just show all homework
        // (class-level filtering would require storing className on homework)
        // For now, show all homework (teacher creates for whole class)
      }
    }

    const homework = await Homework.find(query)
      .sort({ createdAt: -1 })
      .populate("createdByTeacherId", "name");

    const items = homework.map((h: any) => ({
      _id: h._id.toString(),
      id: h._id.toString(),
      subject: h.subject,
      title: h.title,
      description: h.description,
      dueDate: h.dueDate,
      completed: false,
      createdAt: h.createdAt,
    }));

    res.json({ homework: items });
  } catch (err) {
    console.error("GetHomework error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}


export async function createHomework(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (req.user.role !== "teacher") {
      res.status(403).json({ error: "Only teachers can create homework" });
      return;
    }

    const body = HomeworkSchema.parse(req.body);
    const { subject, title, description, dueDate } = body;

    const homework = new Homework({
      subject,
      title,
      description,
      dueDate: dueDate || "????????? ????",
      createdByTeacherId: req.user._id,
    });

    await homework.save();

    res.status(201).json({
      id: homework._id.toString(),
      subject,
      title,
      description,
      dueDate: homework.dueDate,
      createdAt: homework.createdAt,
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

export async function updateHomeworkStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, studentId } = req.body;

    if (!["pending", "in_progress", "completed"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const finalStudentId =
      req.user.role === "student" ? req.user._id.toString() : studentId;

    if (!finalStudentId) {
      res.status(400).json({ error: "studentId is required" });
      return;
    }

    const hwStatus = await HomeworkStatus.findOneAndUpdate(
      { homeworkId: id, studentId: finalStudentId },
      { status, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({
      homeworkId: id,
      studentId: finalStudentId,
      status,
      updatedAt: hwStatus.updatedAt,
    });
  } catch (err) {
    console.error("UpdateHomeworkStatus error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
