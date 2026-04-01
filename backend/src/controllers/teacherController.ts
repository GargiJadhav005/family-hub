import { Request, Response } from "express";
import { User, Student } from "../models";
import { AuthRequest } from "../middleware/auth";
import { hashPassword, signToken, toClientUser } from "../utils/auth";
import { z } from "zod";

const EnrollSchema = z.object({
  name: z.string().min(1),
  parentName: z.string().min(1),
  className: z.string().min(1),
});

function generateId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generatePassword(): string {
  return "Pass" + Math.floor(1000 + Math.random() * 9000);
}

export async function enrollStudent(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== "teacher") {
      res.status(403).json({ error: "Only teachers can enroll students" });
      return;
    }

    const body = EnrollSchema.parse(req.body);
    const { name, parentName, className } = body;

    const id = "STU" + generateId();
    const rollNum = "01";
    const baseEmail = name
      .toLowerCase()
      .replace(/\s/g, ".")
      .replace(/[^a-z.]/g, "");
    const studentEmail = `${baseEmail}@school.edu`;
    const parentEmail = `parent.${baseEmail}@school.edu`;

    const studentPasswordPlain = generatePassword();
    const parentPasswordPlain = generatePassword();

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
      className,
      parentName,
      studentEmail,
      parentEmail,
      studentUserId: studentUser._id,
      parentUserId: parentUser._id,
      createdByTeacherId: req.user._id,
    });

    await student.save();

    res.status(201).json({
      student: {
        id,
        name,
        roll: rollNum,
        class: className,
        parentName,
        studentEmail,
        studentPassword: studentPasswordPlain,
        parentEmail,
        parentPassword: parentPasswordPlain,
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
