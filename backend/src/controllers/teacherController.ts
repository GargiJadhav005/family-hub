import { Request, Response } from "express";
import { User, Student, Homework, Score, Attendance } from "../models";
import { AuthRequest } from "../middleware/auth";
import { hashPassword, toClientUser } from "../utils/auth";
import { getMetaValue } from "../utils/auth";
import { z } from "zod";

const EnrollSchema = z.object({
  name: z.string().min(1),
  parentName: z.string().min(1),
  className: z.string().min(1),
  motherName: z.string().optional(),
  fatherName: z.string().optional(),
  roll: z.string().min(1).max(32).optional(),
  idNumber: z.string().optional(),
  regNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["", "male", "female", "other"]).optional(),
  address: z.string().optional(),
  parentPhone: z.string().optional(),
  alternateGuardianName: z.string().optional(),
  alternateGuardianPhone: z.string().optional(),
  admissionDate: z.string().optional(),
  bloodGroup: z.string().optional(),
  previousSchool: z.string().optional(),
  notes: z.string().optional(),
  studentPhone: z.string().optional(),
  motherTongue: z.string().optional(),
  medium: z.string().optional(),
  udiseNumber: z.string().optional(),
  // Teacher-provided emails (optional — system will generate if omitted)
  studentEmail: z.string().email().optional().or(z.literal('')),
  parentEmail: z.string().email().optional().or(z.literal('')),
  // Teacher-provided password (optional — system will generate if omitted)
  studentPassword: z.string().min(4).optional().or(z.literal('')),
  parentPassword: z.string().min(4).optional().or(z.literal('')),
  mailingAddress: z
    .object({
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
    })
    .optional(),
  emergencyContact: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      relation: z.string().optional(),
    })
    .optional(),
});

function generatePassword(): string {
  return "Pass" + Math.floor(1000 + Math.random() * 9000);
}

/**
 * GET /api/teacher/dashboard
 * Returns aggregated stats for the teacher dashboard in one call
 */
export async function getTeacherDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== "teacher") {
      res.status(403).json({ error: "Teachers only" });
      return;
    }

    const teacherClass = getMetaValue(req.user.meta, "class");
    const query = teacherClass ? { className: teacherClass } : {};

    const [studentCount, homeworkCount, recentStudents] = await Promise.all([
      Student.countDocuments(query),
      Homework.countDocuments({ createdByTeacherId: req.user._id }),
      Student.find(query).select("name roll className").sort({ roll: 1 }).limit(8).lean(),
    ]);

    res.json({
      studentCount,
      homeworkCount,
      recentStudents: recentStudents.map((s: any) => ({
        id: s._id.toString(),
        name: s.name,
        roll: s.roll,
        className: s.className,
      })),
      teacherClass: teacherClass || null,
    });
  } catch (err: any) {
    console.error("TeacherDashboard error:", err);
    res.status(500).json({ error: "Dashboard error" });
  }
}

export async function enrollStudent(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== "teacher") {
      res.status(403).json({ error: "Only teachers can enroll students" });
      return;
    }

    const body = EnrollSchema.parse(req.body);
    let { className } = body;
    const teacherClass = getMetaValue(req.user.meta, "class");
    if (teacherClass && className !== teacherClass) {
      res.status(403).json({ error: "You can only enroll students in your assigned class" });
      return;
    }
    if (teacherClass) {
      className = teacherClass;
    }

    const {
      name,
      parentName,
      roll: rollOverride,
      motherName = "",
      fatherName = "",
      idNumber = "",
      regNumber = "",
      dateOfBirth = "",
      gender = "",
      address = "",
      parentPhone = "",
      alternateGuardianName = "",
      alternateGuardianPhone = "",
      admissionDate = "",
      bloodGroup = "",
      previousSchool = "",
      notes = "",
      studentPhone = "",
      motherTongue = "",
      medium = "",
      udiseNumber = "",
      mailingAddress,
      emergencyContact,
      studentEmail: studentEmailInput,
      parentEmail: parentEmailInput,
      studentPassword: studentPasswordInput,
      parentPassword: parentPasswordInput,
    } = body;

    let rollNum: string;
    if (rollOverride?.trim()) {
      rollNum = rollOverride.trim();
      const dup = await Student.findOne({ className, roll: rollNum });
      if (dup) {
        res.status(400).json({ error: "Roll number already used in this class" });
        return;
      }
    } else {
      const existingCount = await Student.countDocuments({ className });
      rollNum = String(existingCount + 1).padStart(2, "0");
    }

    // Use teacher-provided emails or generate fallbacks
    const timestamp = Date.now().toString(36).slice(-4);
    const baseEmail = name.toLowerCase().replace(/\s/g, ".").replace(/[^a-z.]/g, "");
    const studentEmail = studentEmailInput?.trim() || `${baseEmail}.${timestamp}@school.edu`;
    const parentEmail = parentEmailInput?.trim() || `parent.${baseEmail}.${timestamp}@school.edu`;

    // Use teacher-provided passwords or generate fallbacks
    const studentPasswordPlain = studentPasswordInput?.trim() || generatePassword();
    const parentPasswordPlain = parentPasswordInput?.trim() || generatePassword();

    const studentHash = await hashPassword(studentPasswordPlain);
    const parentHash = await hashPassword(parentPasswordPlain);

    const studentUser = new User({
      name,
      email: studentEmail,
      passwordHash: studentHash,
      role: "student",
      meta: new Map([
        ["class", className],
        ["roll", rollNum],
      ]),
    });

    const parentUser = new User({
      name: parentName,
      email: parentEmail,
      passwordHash: parentHash,
      role: "parent",
      meta: new Map([
        ["child", name],
        ["class", className],
      ]),
    });

    await studentUser.save();
    await parentUser.save();

    const student = new Student({
      name,
      roll: rollNum,
      idNumber,
      regNumber,
      className,
      parentName,
      motherName,
      fatherName,
      studentEmail,
      parentEmail,
      studentUserId: studentUser._id,
      parentUserId: parentUser._id,
      createdByTeacherId: req.user._id,
      dateOfBirth,
      gender,
      address,
      parentPhone,
      alternateGuardianName,
      alternateGuardianPhone,
      admissionDate,
      bloodGroup,
      previousSchool,
      notes,
      studentPhone,
      motherTongue,
      medium,
      udiseNumber,
      mailingAddress: mailingAddress || {},
      emergencyContact: emergencyContact || {},
    });

    await student.save();

    res.status(201).json({
      student: {
        id: student._id.toString(),
        name,
        roll: rollNum,
        class: className,
        parentName,
        motherName: student.motherName,
        fatherName: student.fatherName,
        studentEmail,
        studentPassword: studentPasswordPlain,
        parentEmail,
        parentPassword: parentPasswordPlain,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        address: student.address,
        mailingAddress: student.mailingAddress,
        studentPhone: student.studentPhone,
        parentPhone: student.parentPhone,
        alternateGuardianName: student.alternateGuardianName,
        alternateGuardianPhone: student.alternateGuardianPhone,
        admissionDate: student.admissionDate,
        bloodGroup: student.bloodGroup,
        previousSchool: student.previousSchool,
        notes: student.notes,
        emergencyContact: student.emergencyContact,
        studentUser: toClientUser(studentUser),
        parentUser: toClientUser(parentUser),
      }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      res.status(400).json({ error: `${field} already exists` });
      return;
    }
    console.error("Enroll error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
