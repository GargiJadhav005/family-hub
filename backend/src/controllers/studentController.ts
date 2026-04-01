import { Request, Response } from "express";
import { Student } from "../models";
import { AuthRequest } from "../middleware/auth";

export async function getStudents(req: AuthRequest, res: Response): Promise<void> {
  try {
    const students = await Student.find({})
      .populate("studentUserId", "name email role")
      .populate("parentUserId", "name email role")
      .populate("createdByTeacherId", "name email");

    const items = students.map((s: any) => ({
      id: s._id.toString(),
      name: s.name,
      roll: s.roll,
      class: s.className,
      parentName: s.parentName,
      studentEmail: s.studentEmail,
      parentEmail: s.parentEmail,
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

    const item = {
      id: student._id.toString(),
      name: student.name,
      roll: student.roll,
      class: student.className,
      parentName: student.parentName,
      studentEmail: student.studentEmail,
      parentEmail: student.parentEmail,
    };

    res.json({ student: item });
  } catch (err) {
    console.error("GetStudentById error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
