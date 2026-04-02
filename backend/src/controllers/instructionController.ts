import { Response } from "express";
import { Instruction, Student } from "../models";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

const CreateInstructionSchema = z.object({
  studentId: z.string(),
  message: z.string().min(1),
});

/**
 * GET /api/instructions
 * Teacher: sees instructions for their class students
 * Parent: sees instructions for their children
 */
export async function listInstructions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    let filter: any = {};

    if (user.role === "teacher") {
      filter.teacherId = user._id;
      // Also filter by class students
      const teacherClass = user.meta?.get?.("class") ?? user.meta?.class;
      if (teacherClass) {
        const classStudents = await Student.find({ className: teacherClass }).select("_id");
        filter.studentId = { $in: classStudents.map((s) => s._id) };
      }
    } else if (user.role === "parent") {
      const students = await Student.find({ parentUserId: user._id });
      const studentIds = students.map((s) => s._id);
      filter.studentId = { $in: studentIds };
    }

    const instructions = await Instruction.find(filter)
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ instructions });
  } catch (err) {
    console.error("listInstructions error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/instructions
 * Teacher posts a note — validates student belongs to their class
 */
export async function createInstruction(req: AuthRequest, res: Response): Promise<void> {
  try {
    const body = CreateInstructionSchema.parse(req.body);

    // Validate student belongs to teacher's class
    const student = await Student.findById(body.studentId);
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    const teacherClass = req.user.meta?.get?.("class") ?? req.user.meta?.class;
    if (teacherClass && student.className !== teacherClass) {
      res.status(403).json({ error: "Student not in your class" });
      return;
    }

    const instruction = await Instruction.create({
      ...body,
      teacherId: req.user._id,
      teacherName: req.user.name,
    });

    res.status(201).json({ instruction });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("createInstruction error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
