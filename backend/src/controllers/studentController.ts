import { Request, Response } from "express";
import { Student } from "../models";
import { AuthRequest } from "../middleware/auth";

/**
 * GET /api/students
 * - Teacher: returns only students in their class (meta.class)
 * - Parent: returns only their children
 * - Student: returns only themselves
 * - Admin: returns all
 */
export async function getStudents(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    let query: any = {};

    if (user.role === "teacher") {
      // Teacher sees only their class students
      const teacherClass = user.meta?.get?.("class") ?? user.meta?.class;
      if (teacherClass) {
        query.className = teacherClass;
      }
    } else if (user.role === "parent") {
      // Parent sees only their children
      query.parentUserId = user._id;
    } else if (user.role === "student") {
      // Student sees only themselves
      query.studentUserId = user._id;
    }
    // Admin sees all (no filter)

    const students = await Student.find(query)
      .populate("studentUserId", "name email role")
      .populate("parentUserId", "name email role")
      .populate("createdByTeacherId", "name email")
      .sort({ roll: 1 });

    const items = students.map((s: any) => ({
      id: s._id.toString(),
      name: s.name,
      roll: s.roll,
      class: s.className,
      parentName: s.parentName,
      studentEmail: s.studentEmail,
      parentEmail: s.parentEmail,
      studentUserId: s.studentUserId?._id?.toString(),
      parentUserId: s.parentUserId?._id?.toString(),
      createdAt: s.createdAt,
    }));

    res.json({ students: items });
  } catch (err) {
    console.error("GetStudents error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getStudentById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const student = await Student.findById(id)
      .populate("studentUserId", "name email role")
      .populate("parentUserId", "name email role");

    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    // Access control
    const user = req.user;
    if (user.role === "teacher") {
      const teacherClass = user.meta?.get?.("class") ?? user.meta?.class;
      if (student.className !== teacherClass) {
        res.status(403).json({ error: "Student not in your class" });
        return;
      }
    } else if (user.role === "parent") {
      if (student.parentUserId?.toString() !== user._id.toString()) {
        res.status(403).json({ error: "Not your child" });
        return;
      }
    }

    const item = {
      id: student._id.toString(),
      name: student.name,
      roll: student.roll,
      class: student.className,
      parentName: student.parentName,
      studentEmail: student.studentEmail,
      parentEmail: student.parentEmail,
      studentUserId: (student.studentUserId as any)?._id?.toString(),
      parentUserId: (student.parentUserId as any)?._id?.toString(),
    };

    res.json({ student: item });
  } catch (err) {
    console.error("GetStudentById error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
