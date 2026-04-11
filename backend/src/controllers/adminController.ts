import { Request, Response } from "express";
import {
  User,
  Enquiry,
  Announcement,
  Notification,
  Student,
  Homework,
  HomeworkStatus,
  Attendance,
  Score,
  Meeting,
} from "../models";
import { AuthRequest } from "../middleware/auth";
import { hashPassword, toClientUser } from "../utils/auth";
import {
  sendUserCreatedEmail,
  sendEnquiryEmail,
  sendEnquiryResponseEmail,
} from "../utils/email";
import { z } from "zod";

// ===================== SCHEMAS =====================

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["teacher", "student", "parent"]),
});

const UpdateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
});

const CreateAnnouncementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  audience: z.enum(["all", "teachers", "students", "parents"]),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

const QuerySchema = z.object({
  role: z.enum(["teacher", "student", "parent"]).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// ===================== UTILS =====================

function generatePassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
  return Array.from({ length: 12 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

async function sendNotification({
  userId,
  title,
  message,
  event,
}: {
  userId: any;
  title: string;
  message: string;
  event: string;
}) {
  await Notification.create({ userId, title, message, event });
}

// ===================== DASHBOARD =====================

export async function getDashboard(req: AuthRequest, res: Response) {
  try {
    const [totalUsers, teachers, students, parents, newEnquiries, announcements] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "teacher" }),
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "parent" }),
        Enquiry.countDocuments({ status: "new" }),
        Announcement.countDocuments({ isActive: true }),
      ]);

    res.json({
      totalUsers,
      teachers,
      students,
      parents,
      newEnquiries,
      announcements,
    });
  } catch (err) {
    res.status(500).json({ error: "Dashboard error" });
  }
}

// ===================== USERS =====================

export async function getAllUsers(req: AuthRequest, res: Response) {
  try {
    const parsed = QuerySchema.parse(req.query);

    const page = Number(parsed.page) || 1;
    const limit = Number(parsed.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (parsed.role) filter.role = parsed.role;
    if (parsed.isActive) filter.isActive = parsed.isActive === "true";

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      total,
      page,
      limit,
      users: users.map(toClientUser),
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

// ===================== CREATE USER =====================

export async function createUser(req: AuthRequest, res: Response) {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const { name, email, role } = CreateUserSchema.parse(req.body);

    // Validate that email is provided by user (not auto-generated)
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email address is required" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() }).session(session);
    if (exists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Auto-generate temporary password
    const tempPassword = generatePassword();
    const passwordHash = await hashPassword(tempPassword);

    const [user] = await User.create(
      [{
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        mustChangePassword: true, // User must change password on first login
      }],
      { session }
    );

    // Notification - use both recipientId and userId for compatibility
    await Notification.create(
      [
        {
          recipientId: user._id,
          userId: user._id,
          event: "account_created",
          title: "Account Created",
          message: `Your ${role} account has been created`,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Send email (outside transaction)
    sendUserCreatedEmail(email, name, role, tempPassword).catch(console.error);

    const response: any = {
      message: "User created successfully",
      user: toClientUser(user),
    };

    // Always return temporary password so admin can share it
    response.temporaryPassword = tempPassword;

    res.status(201).json(response);
  } catch (err: any) {
    await session.abortTransaction();

    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }

    res.status(500).json({ error: "User creation failed" });
  } finally {
    session.endSession();
  }
}

// ===================== UPDATE USER =====================

export async function updateUser(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;
    const body = UpdateUserSchema.parse(req.body);

    if (body.email) {
      const exists = await User.findOne({
        email: body.email,
        _id: { $ne: userId },
      });
      if (exists) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    const user = await User.findByIdAndUpdate(userId, body, {
      new: true,
    }).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Updated", user: toClientUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
}

// ===================== DELETE USER =====================

export async function deleteUser(req: AuthRequest, res: Response) {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const { userId } = req.params;

    if (userId === req.user!._id.toString()) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Cascading deletes based on user role
    if (user.role === "student") {
      // Find student record
      const student = await Student.findOne({ studentUserId: userId }).session(session);
      if (student) {
        // Delete homework statuses for this student
        await HomeworkStatus.deleteMany({ studentId: student._id }).session(session);
        // Delete attendance records
        await Attendance.deleteMany({ studentId: student._id }).session(session);
        // Delete scores
        await Score.deleteMany({ studentId: student._id }).session(session);
        // Delete meetings
        await Meeting.deleteMany({ studentId: student._id }).session(session);
        // Delete student record
        await Student.findByIdAndDelete(student._id).session(session);
      }
    } else if (user.role === "parent") {
      // Update student records to remove parent reference (don't delete students)
      await Student.updateMany(
        { parentUserId: userId },
        { $unset: { parentUserId: 1 } }
      ).session(session);
      // Delete meetings where parent is involved
      await Meeting.deleteMany({ parentId: userId }).session(session);
    } else if (user.role === "teacher") {
      // Delete homework created by this teacher
      const homeworkIds = await Homework.find({ createdByTeacherId: userId })
        .select("_id")
        .session(session);
      const hwIds = homeworkIds.map((h) => h._id);
      
      // Delete homework statuses for those homeworks
      await HomeworkStatus.deleteMany({ homeworkId: { $in: hwIds } }).session(session);
      // Delete the homework
      await Homework.deleteMany({ createdByTeacherId: userId }).session(session);
      // Delete attendance marked by this teacher
      await Attendance.deleteMany({ markedByTeacherId: userId }).session(session);
      // Delete meetings scheduled by this teacher
      await Meeting.deleteMany({ teacherId: userId }).session(session);
      // Delete scores given by this teacher
      await Score.deleteMany({ createdByTeacherId: userId }).session(session);
    }

    // Delete all notifications for this user
    await Notification.deleteMany({
      $or: [{ userId }, { recipientId: userId }],
    }).session(session);

    // Finally delete the user
    await User.findByIdAndDelete(userId).session(session);

    await session.commitTransaction();

    res.json({
      message: "User and all associated data deleted successfully",
      deletedRole: user.role,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("DeleteUser error:", err);
    res.status(500).json({ error: "Delete failed" });
  } finally {
    session.endSession();
  }
}

// ===================== ANNOUNCEMENTS =====================

export async function createAnnouncement(req: AuthRequest, res: Response) {
  try {
    const { title, content, audience, priority } =
      CreateAnnouncementSchema.parse(req.body);

    const announcement = await Announcement.create({
      title,
      content,
      audience,
      priority: priority || "medium",
      createdBy: req.user!._id,
    });

    // Broadcast notifications
    const roles =
      audience === "all"
        ? ["teacher", "student", "parent"]
        : [audience.slice(0, -1)];

    const users = await User.find({ role: { $in: roles } }).select("_id");

    const notifications = users.map((u) => ({
      userId: u._id,
      event: "announcement",
      title,
      message: content,
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({ announcement });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: "Announcement failed" });
  }
}

// ===================== ENQUIRIES =====================

export async function getEnquiries(req: AuthRequest, res: Response) {
  try {
    const enquiries = await Enquiry.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ enquiries });
  } catch {
    res.status(500).json({ error: "Failed to fetch enquiries" });
  }
}

export async function respondToEnquiry(req: AuthRequest, res: Response) {
  try {
    const { enquiryId } = req.params;
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ error: "Response required" });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      enquiryId,
      {
        status: "responded",
        response,
        respondedBy: req.user!._id,
        respondedAt: new Date(),
      },
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({ error: "Not found" });
    }

    // Send email response
    await sendEnquiryResponseEmail(
      enquiry.email,
      enquiry.name,
      response
    );

    res.json({ message: "Responded", enquiry });
  } catch {
    res.status(500).json({ error: "Response failed" });
  }
}

export async function markEnquiryAsRead(req: AuthRequest, res: Response) {
  try {
    const { enquiryId } = req.params;

    const enquiry = await Enquiry.findByIdAndUpdate(
      enquiryId,
      { status: "read" },
      { new: true }
    );

    res.json({ enquiry });
  } catch {
    res.status(500).json({ error: "Failed" });
  }
}
