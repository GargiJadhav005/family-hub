import { Request, Response } from "express";
import { Homework, HomeworkStatus, Student } from "../models";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

const HomeworkSchema = z.object({
  subject: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  className: z.string().min(1),
  dueDate: z.string().optional(),
});

export async function getHomework(req: AuthRequest, res: Response): Promise<void> {
  try {
    const query: any = {};
    
    if (req.user.role === "teacher") {
      query.createdByTeacherId = req.user._id;
    } else if (req.user.role === "student") {
      const className = req.user.meta?.get?.("class") || req.user.meta?.class;
      if (className) {
        query.className = className;
      }
    } else if (req.user.role === "parent") {
      // Get children's classes
      const children = await Student.find({ parentUserId: req.user._id });
      if (children.length > 0) {
        const classNames = [...new Set(children.map((c) => c.className))];
        query.className = { $in: classNames };
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
      className: h.className,
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
    const { subject, title, description, className, dueDate } = body;

    const homework = new Homework({
      subject,
      title,
      description,
      className,
      dueDate: dueDate || "अनिर्दिष्ट",
      createdByTeacherId: req.user._id,
    });

    await homework.save();

    res.status(201).json({
      homework: {
        id: homework._id.toString(),
        subject,
        title,
        description,
        className,
        dueDate: homework.dueDate,
        createdAt: homework.createdAt,
      }
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

    let finalStudentId = studentId;

    // For students, auto-resolve to their Student._id
    if (req.user.role === "student") {
      const studentDoc = await Student.findOne({ studentUserId: req.user._id });
      if (!studentDoc) {
        res.status(404).json({ error: "Student record not found" });
        return;
      }
      finalStudentId = studentDoc._id.toString();
    }

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

/**
 * GET /api/homework/student/all
 * Returns homework for student's class with completion status
 */
export async function getStudentAllHomeworkWithStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (req.user.role !== "student") {
      res.status(403).json({ error: "Only students can access their homework status" });
      return;
    }

    // Resolve Student._id from User._id
    const studentDoc = await Student.findOne({ studentUserId: req.user._id });
    if (!studentDoc) {
      res.status(404).json({ error: "Student record not found" });
      return;
    }

    const className = studentDoc.className;

    // Get all homework for student's class
    const homeworkList = await Homework.find({ className })
      .sort({ createdAt: -1 })
      .populate("createdByTeacherId", "name");

    // Get student's status for each homework (using Student._id)
    const homeworkWithStatus = await Promise.all(
      homeworkList.map(async (hw: any) => {
        const status = await HomeworkStatus.findOne({
          studentId: studentDoc._id,
          homeworkId: hw._id,
        });

        return {
          _id: hw._id.toString(),
          id: hw._id.toString(),
          subject: hw.subject,
          title: hw.title,
          description: hw.description,
          dueDate: hw.dueDate,
          className: hw.className,
          createdBy: hw.createdByTeacherId?.name || "Teacher",
          status: status?.status || "pending",
          statusUpdatedAt: status?.updatedAt || null,
          feedback: status?.feedback || null,
          createdAt: hw.createdAt,
        };
      })
    );

    res.json({ homeworks: homeworkWithStatus });
  } catch (err) {
    console.error("GetStudentAllHomeworkWithStatus error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
