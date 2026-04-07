import { Response } from "express";
import { Instruction, Student } from "../models";
import { AuthRequest } from "../middleware/auth";
import { getMetaValue } from "../utils/auth";
import { z } from "zod";

/**
 * ============================
 * 📌 Validation Schema
 * ============================
 */
const CreateInstructionSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  message: z.string().min(1, "Message cannot be empty").max(500),
});

/**
 * ============================
 * 📌 GET /api/instructions
 * Role-based fetching:
 * - Teacher → their class students
 * - Parent → their children
 * - Admin → all instructions
 * ============================
 */
export async function listInstructions(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    let filter: any = {};

    /**
     * 🧑‍🏫 TEACHER LOGIC
     */
    if (user.role === "teacher") {
      filter.teacherId = user._id;

      const teacherClass = getMetaValue(user.meta, "class");

      if (teacherClass) {
        const classStudents = await Student.find({
          className: teacherClass,
        }).select("_id");

        filter.studentId = {
          $in: classStudents.map((s) => s._id),
        };
      }
    }

    /**
     * 👨‍👩‍👧 PARENT LOGIC
     */
    else if (user.role === "parent") {
      const students = await Student.find({
        parentUserId: user._id,
      }).select("_id");

      filter.studentId = {
        $in: students.map((s) => s._id),
      };
    }

    /**
     * 🛠️ ADMIN LOGIC (NEW)
     */
    else if (user.role === "admin") {
      // Admin sees everything → no filter
      filter = {};
    }

    /**
     * 📦 FETCH DATA
     */
    const instructions = await Instruction.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("studentId", "name className")
      .lean();

    /**
     * 📤 RESPONSE FORMAT (AI-Friendly)
     */
    const formatted = instructions.map((inst: any) => ({
      id: inst._id.toString(),
      message: inst.message,
      student: inst.studentId
        ? {
            id: inst.studentId._id,
            name: inst.studentId.name,
            className: inst.studentId.className,
          }
        : null,
      teacherId: inst.teacherId,
      teacherName: inst.teacherName,
      createdAt: inst.createdAt,
    }));

    res.json({ instructions: formatted });
  } catch (err) {
    console.error("❌ listInstructions error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * ============================
 * 📌 POST /api/instructions
 * Teacher creates instruction
 * + Validation
 * + Class restriction
 * + Notification Hook (Future Ready)
 * ============================
 */
export async function createInstruction(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    /**
     * 🔐 AUTH CHECK
     */
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    /**
     * 🔐 ROLE CHECK
     */
    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      res.status(403).json({
        error: "Only teachers or admins can create instructions",
      });
      return;
    }

    /**
     * 📥 VALIDATION
     */
    const body = CreateInstructionSchema.parse(req.body);

    /**
     * 🔍 VERIFY STUDENT
     */
    const student = await Student.findById(body.studentId);

    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    /**
     * 🚫 CLASS SECURITY (Teacher only)
     */
    if (req.user.role === "teacher") {
      const teacherClass = getMetaValue(req.user.meta, "class");

      if (teacherClass && student.className !== teacherClass) {
        res.status(403).json({
          error: "You can only send instructions to your class students",
        });
        return;
      }
    }

    /**
     * 📝 CREATE INSTRUCTION
     */
    const instruction = await Instruction.create({
      studentId: body.studentId,
      message: body.message,
      teacherId: req.user._id,
      teacherName: req.user.name,
    });

    /**
     * 🔔 FUTURE: MOBILE NOTIFICATION HOOK
     * (Integrate Firebase / WebSocket here)
     */
    // await sendNotification({
    //   userId: student.parentUserId,
    //   title: "New Instruction",
    //   message: body.message,
    // });

    /**
     * 📤 RESPONSE
     */
    res.status(201).json({
      instruction: {
        id: instruction._id.toString(),
        studentId: instruction.studentId,
        message: instruction.message,
        teacherName: instruction.teacherName,
        createdAt: instruction.createdAt,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: err.errors,
      });
      return;
    }

    console.error("❌ createInstruction error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}