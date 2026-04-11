import { Request, Response } from "express";
import { User, Student, Notification } from "../models";
import { AuthRequest } from "../middleware/auth";
import { hashPassword, signToken, toClientUser } from "../utils/auth";
import { sendUserCreatedEmail } from "../utils/email";
import { z } from "zod";

const EnrollSchema = z.object({
  name: z.string().min(1),
  parentName: z.string().min(1),
  className: z.string().min(1),
  studentEmail: z.string().email("Valid student email is required"),
  parentEmail: z.string().email("Valid parent email is required"),
});

function generatePassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
  return Array.from({ length: 10 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

export async function enrollStudent(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== "teacher") {
      res.status(403).json({ error: "Only teachers can enroll students" });
      return;
    }

    const body = EnrollSchema.parse(req.body);
    const { name, parentName, className, studentEmail, parentEmail } = body;

    // Validate emails are provided by user
    if (!studentEmail || !parentEmail) {
      res.status(400).json({ error: "Both student and parent email addresses are required" });
      return;
    }

    // Check if emails already exist
    const existingStudentEmail = await User.findOne({ email: studentEmail.toLowerCase() });
    if (existingStudentEmail) {
      res.status(400).json({ error: "Student email already exists" });
      return;
    }

    const existingParentEmail = await User.findOne({ email: parentEmail.toLowerCase() });
    if (existingParentEmail) {
      res.status(400).json({ error: "Parent email already exists" });
      return;
    }

    // Auto-generate sequential roll number for the class
    const existingCount = await Student.countDocuments({ className });
    const rollNum = String(existingCount + 1).padStart(2, "0");

    // Auto-generate temporary passwords
    const studentPasswordPlain = generatePassword();
    const parentPasswordPlain = generatePassword();

    const studentHash = await hashPassword(studentPasswordPlain);
    const parentHash = await hashPassword(parentPasswordPlain);

    const studentUser = new User({
      name,
      email: studentEmail.toLowerCase(),
      passwordHash: studentHash,
      role: "student",
      mustChangePassword: true,
      meta: new Map([
        ["class", className],
        ["roll", rollNum],
      ]),
    });

    const parentUser = new User({
      name: parentName,
      email: parentEmail.toLowerCase(),
      passwordHash: parentHash,
      role: "parent",
      mustChangePassword: true,
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
      studentEmail: studentEmail.toLowerCase(),
      parentEmail: parentEmail.toLowerCase(),
      studentUserId: studentUser._id,
      parentUserId: parentUser._id,
      createdByTeacherId: req.user._id,
    });

    await student.save();

    // Create notifications for new accounts
    await Notification.insertMany([
      {
        recipientId: studentUser._id,
        userId: studentUser._id,
        event: "account_created",
        title: "Account Created",
        message: `Your student account has been created for class ${className}`,
      },
      {
        recipientId: parentUser._id,
        userId: parentUser._id,
        event: "account_created",
        title: "Account Created",
        message: `Your parent account has been created. Your child ${name} is enrolled in class ${className}`,
      },
    ]);

    // Send welcome emails with temporary passwords
    sendUserCreatedEmail(studentEmail, name, "student", studentPasswordPlain).catch(console.error);
    sendUserCreatedEmail(parentEmail, parentName, "parent", parentPasswordPlain).catch(console.error);

    res.status(201).json({
      student: {
        id: student._id.toString(),
        name,
        roll: rollNum,
        class: className,
        parentName,
        studentEmail: studentEmail.toLowerCase(),
        studentPassword: studentPasswordPlain,
        parentEmail: parentEmail.toLowerCase(),
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
