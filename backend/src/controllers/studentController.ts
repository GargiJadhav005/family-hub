import { Request, Response } from "express";
import { Student } from "../models";
import { AuthRequest } from "../middleware/auth";
import { getMetaValue } from "../utils/auth";

/**
 * GET /api/students
 */
export async function getStudents(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const user = req.user;
    let query: any = {};

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    // Filters
    const search = req.query.search as string;
    const className = req.query.className as string;

    // Role-based filtering
    if (user.role === "teacher") {
      const teacherClass = getMetaValue(user.meta, "class");
      if (teacherClass) {
        query.className = teacherClass;
      }
    } else if (user.role === "parent") {
      query.parentUserId = user._id;
    } else if (user.role === "student") {
      query.studentUserId = user._id;
    } else if (user.role === "admin") {
      query = {}; // explicit
    }

    // Additional filters
    if (className) {
      query.className = className;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { roll: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Student.countDocuments(query);

    const students = await Student.find(query)
      .populate("studentUserId", "name email role")
      .populate("parentUserId", "name email role")
      .populate("createdByTeacherId", "name email")
      .sort({ roll: 1 })
      .skip(skip)
      .limit(limit);

    const showEmail = ["teacher", "admin"].includes(user.role);

    const items = students.map((s: any) => ({
      id: s._id.toString(),
      name: s.name,
      roll: s.roll,
      class: s.className,
      parentName: s.parentName,
      studentEmail: showEmail ? s.studentEmail : undefined,
      parentEmail: showEmail ? s.parentEmail : undefined,
      studentUserId: s.studentUserId?._id?.toString(),
      parentUserId: s.parentUserId?._id?.toString(),
      createdAt: s.createdAt,
    }));

    res.json({
      students: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("GetStudents error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/students/:id
 */
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

    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const user = req.user;

    // Access control
    if (user.role === "teacher") {
      const teacherClass = getMetaValue(user.meta, "class");
      if (student.className !== teacherClass) {
        res.status(403).json({ error: "Student not in your class" });
        return;
      }
    } else if (user.role === "parent") {
      if (student.parentUserId?.toString() !== user._id.toString()) {
        res.status(403).json({ error: "Not your child" });
        return;
      }
    } else if (user.role === "student") {
      if (student.studentUserId?.toString() !== user._id.toString()) {
        res.status(403).json({ error: "Not authorized" });
        return;
      }
    }

    const showEmail = ["teacher", "admin"].includes(user.role);

    const item = {
      id: student._id.toString(),
      name: student.name,
      roll: student.roll,
      class: student.className,
      parentName: student.parentName,
      studentEmail: showEmail ? student.studentEmail : undefined,
      parentEmail: showEmail ? student.parentEmail : undefined,
      studentUserId: (student.studentUserId as any)?._id?.toString(),
      parentUserId: (student.parentUserId as any)?._id?.toString(),
    };

    res.json({ student: item });
  } catch (err) {
    console.error("GetStudentById error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PUT /api/students/:id
 */
export async function updateStudent(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (!["teacher", "admin"].includes(req.user.role)) {
      res.status(403).json({ error: "Not allowed" });
      return;
    }

    const { id } = req.params;
    const updates = req.body;

    const student = await Student.findById(id);
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    // Teacher can update only their class
    if (req.user.role === "teacher") {
      const teacherClass = getMetaValue(req.user.meta, "class");
      if (student.className !== teacherClass) {
        res.status(403).json({ error: "Student not in your class" });
        return;
      }
    }

    Object.assign(student, updates);
    await student.save();

    res.json({ student });
  } catch (err) {
    console.error("updateStudent error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * DELETE /api/students/:id
 */
export async function deleteStudent(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (req.user.role !== "admin") {
      res.status(403).json({ error: "Only admin can delete" });
      return;
    }

    const { id } = req.params;

    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("deleteStudent error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}