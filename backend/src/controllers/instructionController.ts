import { Response } from "express";
import { Instruction, Student } from "../models";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

const CreateInstructionSchema = z.object({
  studentId: z.string(),
  message: z.string().min(1),
});

// GET /api/instructions → teacher sees all theirs, parent sees for their child
export async function listInstructions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    let filter: any = {};
    if (user.role === "teacher") {
      filter.teacherId = user._id;
    } else if (user.role === "parent") {
      const students = await Student.find({ parentUserId: user._id });
      const studentIds = students.map((s) => s._id);
      filter.studentId = { $in: studentIds };
    }
    const instructions = await Instruction.find(filter).sort({ createdAt: -1 }).limit(10);
    res.json({ instructions });
  } catch (err) {
    console.error("listInstructions error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/instructions → teacher posts a note
export async function createInstruction(req: AuthRequest, res: Response): Promise<void> {
  try {
    const body = CreateInstructionSchema.parse(req.body);
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
